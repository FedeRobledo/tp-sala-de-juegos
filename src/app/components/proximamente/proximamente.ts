import { Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-proximamente',
  imports: [RouterLink],
  templateUrl: './proximamente.html',
  styleUrl: './proximamente.css',
})
export class Proximamente {
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  titulo = computed(() => this.route.snapshot.data['titulo'] ?? 'Sección en desarrollo');
  icono = computed(() => this.route.snapshot.data['icono'] ?? '🚧');
  descripcion = computed(
    () =>
      this.route.snapshot.data['descripcion'] ??
      'Esta funcionalidad se habilitará en los próximos sprints.'
  );

  mensajeUsuario = computed(() => {
    const nombre = this.authService.userDisplayName();

    if (!nombre) {
      return 'Tu sesión está activa.';
    }

    return `Sesión activa como ${nombre}.`;
  });
}