import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
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

  sidebarOpen = signal(true);

  private menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: '🏠',
      route: '/home',
    },
    {
      label: 'Quién soy',
      icon: '👤',
      route: '/quien-soy',
    },
    {
      label: 'Juegos',
      icon: '🎮',
      route: '/juegos',
      requiresAuth: true,
    },
    {
      label: 'Ahorcado',
      icon: '🇦🇷',
      route: '/juegos/ahorcado',
      requiresAuth: true,
    },
    {
      label: 'Mayor o Menor',
      icon: '🃏',
      route: '/juegos/mayor-menor',
      requiresAuth: true,
    },
    {
      label: 'Chat',
      icon: '💬',
      route: '/chat',
      requiresAuth: true,
    },
    {
      label: 'Resultados',
      icon: '🏆',
      route: '/resultados',
      requiresAuth: true,
    },
  ];

  visibleMenuItems = computed(() => {
    const isLoggedIn = this.authService.isLoggedIn();

    return this.menuItems.filter((item) => !item.requiresAuth || isLoggedIn);
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((isOpen) => !isOpen);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/home');
  }
}