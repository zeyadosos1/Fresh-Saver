import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-for-vendors',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './for-vendors.html',
  styleUrl: './for-vendors.css'
})
export class ForVendorsComponent {}
