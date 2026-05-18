import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { vendorGuard } from './guards/vendor-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'browse',
    loadComponent: () => import('./pages/browse-deals/browse-deals').then(m => m.BrowseDealsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-reservations',
    loadComponent: () => import('./pages/my-reservations/my-reservations').then(m => m.MyReservationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vendor',
    loadComponent: () => import('./pages/vendor-dashboard/vendor-dashboard').then(m => m.VendorDashboardComponent),
    canActivate: [vendorGuard]
  },
  {
    path: 'shoppers',
    loadComponent: () => import('./pages/for-shoppers/for-shoppers').then(m => m.ForShoppersComponent)
  },
  {
    path: 'vendors',
    loadComponent: () => import('./pages/for-vendors/for-vendors').then(m => m.ForVendorsComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing').then(m => m.PricingComponent)
  },
  { path: '**', redirectTo: 'home' }
];
