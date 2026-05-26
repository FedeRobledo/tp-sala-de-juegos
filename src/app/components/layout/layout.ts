import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  route: string;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private router = inject(Router);
  authService = inject(AuthService);

  private menuItems: MenuItem[] = [
    {
      label: 'Home',
      route: '/home',
    },
    {
      label: 'Quién soy',
      route: '/quien-soy',
    },
    {
      label: 'Juegos',
      route: '/juegos',
      requiresAuth: true,
    },
    {
      label: 'Ahorcado',
      route: '/juegos/ahorcado',
      requiresAuth: true,
    },
    {
      label: 'Mayor o Menor',
      route: '/juegos/mayor-menor',
      requiresAuth: true,
    },
    {
      label: 'Chat',
      route: '/chat',
      requiresAuth: true,
    },
    {
      label: 'Resultados',
      route: '/resultados',
      requiresAuth: true,
    },
  ];

  visibleMenuItems = computed(() => {
    const isLoggedIn = this.authService.isLoggedIn();

    return this.menuItems.filter((item) => !item.requiresAuth || isLoggedIn);
  });

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/home');
  }
}