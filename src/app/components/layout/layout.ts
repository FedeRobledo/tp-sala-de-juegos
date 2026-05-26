import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  route: string;
  showWhenLoggedIn?: boolean;
  showWhenLoggedOut?: boolean;
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
      label: 'Inicio',
      route: '/home',
      showWhenLoggedIn: true,
      showWhenLoggedOut: true,
    },
    {
      label: 'Quién soy',
      route: '/quien-soy',
      showWhenLoggedIn: true,
      showWhenLoggedOut: true,
    },
    {
      label: 'Juegos',
      route: '/juegos',
      showWhenLoggedIn: true,
    },
    {
      label: 'Resultados',
      route: '/resultados',
      showWhenLoggedIn: true,
    },
        {
      label: 'Chat',
      route: '/chat',
      showWhenLoggedIn: true,
    },
  ];

  visibleMenuItems = computed(() => {
    const isLoggedIn = this.authService.isLoggedIn();

    return this.menuItems.filter((item) => {
      if (isLoggedIn) {
        return item.showWhenLoggedIn;
      }

      return item.showWhenLoggedOut;
    });
  });

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/home');
  }
}