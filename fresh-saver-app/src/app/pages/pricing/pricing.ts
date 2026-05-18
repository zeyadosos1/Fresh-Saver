import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class PricingComponent {}
