import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-for-shoppers',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './for-shoppers.html',
  styleUrl: './for-shoppers.css'
})
export class ForShoppersComponent {}
