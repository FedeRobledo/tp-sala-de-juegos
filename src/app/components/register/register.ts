import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;

  loading = this.authService.loading;
  error = this.authService.error;

  ngOnInit(): void {
    this.authService.clearError();
  }

  async register(): Promise<void> {
    this.authService.error.set(null);

    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const email = this.email.trim();

    if (!nombre) {
      this.authService.error.set('Ingresá tu nombre.');
      return;
    }

    if (!apellido) {
      this.authService.error.set('Ingresá tu apellido.');
      return;
    }

    if (!this.edad || this.edad <= 0 || this.edad > 100) {
      this.authService.error.set('Ingresá una edad válida.');
      return;
    }

    if (!email) {
      this.authService.error.set('Ingresá tu correo electrónico.');
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.authService.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await this.authService.register({
      email,
      password: this.password,
      nombre,
      apellido,
      edad: this.edad,
    });

    if (success) {
      this.router.navigateByUrl('/home');
    }
  }
}