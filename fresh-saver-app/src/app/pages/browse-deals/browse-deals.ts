import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { DealsService, Deal } from '../../services/deals';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-browse-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './browse-deals.html',
  styleUrl: './browse-deals.css'
})
export class BrowseDealsComponent implements OnInit {
  dealsService = inject(DealsService);
  authService = inject(AuthService);
  deals = this.dealsService.deals;

  searchQuery = '';
  selectedCategory = 'All';
  toast = signal('');
  categories = ['All', 'Produce', 'Bakery', 'Dairy', 'Meat', 'Other'];
  
  cart = signal<{deal: Deal, qty: number}[]>([]);

  async ngOnInit() {
    await this.dealsService.fetchDeals();
  }

  get filteredDeals(): Deal[] {
    return this.deals().filter(d => {
      const matchCat = this.selectedCategory === 'All' || d.category === this.selectedCategory;
      const matchSearch = d.item_name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  discount(deal: Deal): number {
    return Math.round((1 - deal.discounted_price / deal.original_price) * 100);
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 4000);
  }

  addToCart(deal: Deal) {
    this.cart.update(items => {
      const existing = items.find(i => i.deal.id === deal.id);
      if (existing) {
        if (existing.qty < deal.stock) {
          existing.qty += 1;
          this.showToast(`Added another ${deal.item_name} to reservations! ✅`);
        } else {
          this.showToast(`Cannot reserve more. Only ${deal.stock} in stock! ❌`);
        }
        return [...items];
      } else {
        this.showToast(`Added ${deal.item_name} to reservations! ✅`);
        return [...items, {deal, qty: 1}];
      }
    });
  }

  removeFromCart(dealId: number) {
    this.cart.update(items => items.filter(i => i.deal.id !== dealId));
  }

  cartTotal(): number {
    return this.cart().reduce((acc, item) => acc + (Number(item.deal.discounted_price) * item.qty), 0);
  }

  async confirmReservation() {
    if (this.cart().length === 0) return;
    const user = this.authService.currentUser();
    if (!user) {
      this.showToast('Please log in to make reservations ❌');
      return;
    }

    const items = this.cart().map(item => ({ deal_id: item.deal.id, qty: item.qty }));
    const success = await this.dealsService.reserveItems(user.id, items);

    if (success) {
      this.cart.set([]);
      this.showToast('Reservations confirmed! 🎉 Check your reservations page.');
      await this.dealsService.fetchDeals(); // Refresh stock
    } else {
      this.showToast('Failed to complete reservations ❌');
    }
  }
}
