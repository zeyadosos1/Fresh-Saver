import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { DealsService } from '../../services/deals';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css'
})
export class MyReservationsComponent implements OnInit {
  dealsService = inject(DealsService);
  authService = inject(AuthService);
  reservations = signal<any[]>([]);

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      try {
        const res = await this.dealsService.fetchReservations(user.id);
        this.reservations.set(res || []);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
