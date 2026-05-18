import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'shopper' | 'vendor';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());
  readonly currentUser = this._user.asReadonly();

  constructor(private router: Router) {}

  private loadUser(): User | null {
    const stored = localStorage.getItem('fs_user');
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedIn(): boolean {
    return this._user() !== null;
  }

  /**
   * Login by calling your XAMPP PHP backend.
   * POST http://localhost/project_framework/api/login.php
   */
  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    const form = new FormData();
    form.append('email', email);
    form.append('password', password);

    try {
      const res = await fetch('http://localhost/project_framework/api/login.php', {
        method: 'POST',
        body: form
      });
      const json = await res.json();

      if (json.success) {
        const user: User = json.data.user;   // API: { success, data: { user } }
        this._user.set(user);
        localStorage.setItem('fs_user', JSON.stringify(user));
        this.router.navigate([user.role === 'vendor' ? '/vendor' : '/browse']);
        return { success: true };
      }
      return { success: false, message: json.message || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Server not reachable. Make sure XAMPP is running.' };
    }
  }

  async register(name: string, email: string, password: string, role: string): Promise<{ success: boolean; message?: string }> {
    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('password', password);
    form.append('role', role);

    try {
      const res = await fetch('http://localhost/project_framework/api/register.php', {
        method: 'POST',
        body: form
      });
      const json = await res.json();
      return { success: json.success, message: json.message };
    } catch {
      return { success: false, message: 'Server not reachable.' };
    }
  }

  logout(): void {
    // Also destroy the PHP session for legacy page compatibility
    fetch('http://localhost/project_framework/api/logout.php', { method: 'POST' }).catch(() => {});
    this._user.set(null);
    localStorage.removeItem('fs_user');
    this.router.navigate(['/auth']);
  }
}
