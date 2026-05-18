import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { DealsService, Deal } from '../../services/deals';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css'
})
export class VendorDashboardComponent implements OnInit {
  auth = inject(AuthService);
  dealsService = inject(DealsService);

  deals = signal<Deal[]>([]);
  toast = signal('');
  showModal = signal(false);
  isEditing = signal(false);
  categories = ['Produce', 'Bakery', 'Dairy', 'Meat', 'Other'];

  form: Partial<Deal> = this.blankForm();

  blankForm(): Partial<Deal> {
    return { item_name: '', category: 'Produce', original_price: 0, discounted_price: 0, expiry_date: '', stock: 1 };
  }

  async ngOnInit() {
    await this.loadDeals();
  }

  async loadDeals() {
    const vendorId = this.auth.currentUser()?.id;
    if (vendorId) {
      this.deals.set(await this.dealsService.fetchVendorDeals(vendorId));
    }
  }

  openAdd() {
    this.form = this.blankForm();
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEdit(deal: Deal) {
    this.form = { ...deal };
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  async save() {
    const vendorId = this.auth.currentUser()!.id;
    if (this.isEditing()) {
      await this.dealsService.editDeal(this.form.id!, this.form, vendorId);
      this.showToast('Deal updated ✅');
    } else {
      await this.dealsService.addDeal(this.form as any, vendorId);
      this.showToast('Deal added 🎉');
    }
    this.showModal.set(false);
    await this.loadDeals();
  }

  async deleteDeal(id: number) {
    if (!confirm('Delete this deal?')) return;
    await this.dealsService.deleteDeal(id);
    await this.loadDeals();
    this.showToast('Deal deleted.');
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 4000);
  }

  discount(deal: Deal): number {
    return Math.round((1 - deal.discounted_price / deal.original_price) * 100);
  }
}
