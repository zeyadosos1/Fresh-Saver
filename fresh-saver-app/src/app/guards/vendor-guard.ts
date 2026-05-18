import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const vendorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.currentUser()?.role === 'vendor') return true;
  router.navigate([auth.isLoggedIn() ? '/browse' : '/auth']);
  return false;
};
