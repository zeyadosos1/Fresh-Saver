import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  auth = inject(AuthService);

  activeForm: 'login' | 'register' = 'login';
  loading = signal(false);
  errorMsg = signal('');

  login = { email: '', password: '' };
  register = { name: '', email: '', password: '', role: 'shopper' };

  async onLogin() {
    this.loading.set(true);
    this.errorMsg.set('');
    const result = await this.auth.login(this.login.email, this.login.password);
    if (!result.success) this.errorMsg.set(result.message || 'Login failed');
    this.loading.set(false);
  }

  async onRegister() {
    this.loading.set(true);
    this.errorMsg.set('');
    const result = await this.auth.register(
      this.register.name,
      this.register.email,
      this.register.password,
      this.register.role
    );
    if (result.success) {
      this.activeForm = 'login';
      this.errorMsg.set('');
    } else {
      this.errorMsg.set(result.message || 'Registration failed');
    }
    this.loading.set(false);
  }
}
