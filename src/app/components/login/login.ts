import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

interface QuickAccessUser {
  label: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  loading = this.authService.loading;
  error = this.authService.error;

  quickAccessUsers: QuickAccessUser[] = [
    {
      label: 'Jugador 1',
      email: 'jugador1@sala.com',
      password: '123456',
    },
    {
      label: 'Jugador 2',
      email: 'jugador2@sala.com',
      password: '123456',
    },
    {
      label: 'Jugador 3',
      email: 'jugador3@sala.com',
      password: '123456',
    },
  ];

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.authService.error.set('Ingresá correo y contraseña.');
      return;
    }

    const success = await this.authService.login({
      email: this.email,
      password: this.password,
    });

    if (success) {
      this.router.navigateByUrl('/home');
    }
  }

  async quickLogin(user: QuickAccessUser): Promise<void> {
    this.email = user.email;
    this.password = user.password;

    const success = await this.authService.login({
      email: user.email,
      password: user.password,
    });

    if (success) {
      this.router.navigateByUrl('/home');
    }
  }
}