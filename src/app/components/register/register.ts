import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;

  loading = this.authService.loading;
  error = this.authService.error;

  async register(): Promise<void> {
    this.authService.error.set(null);

    if (!this.nombre.trim()) {
      this.authService.error.set('Ingresá tu nombre.');
      return;
    }

    if (!this.apellido.trim()) {
      this.authService.error.set('Ingresá tu apellido.');
      return;
    }

    if (!this.email.trim()) {
      this.authService.error.set('Ingresá tu correo electrónico.');
      return;
    }

    if (!this.edad || this.edad <= 0) {
      this.authService.error.set('Ingresá una edad válida.');
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.authService.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await this.authService.register({
      email: this.email.trim(),
      password: this.password,
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      edad: this.edad,
    });

    if (success) {
      this.router.navigateByUrl('/home');
    }
  }
}