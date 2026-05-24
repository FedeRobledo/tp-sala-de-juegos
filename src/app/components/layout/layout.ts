import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
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

  menuItems: MenuItem[] = [
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
    },
    {
      label: 'Ahorcado',
      icon: '🇦🇷',
      route: '/juegos/ahorcado',
    },
    {
      label: 'Resultados',
      icon: '🏆',
      route: '/resultados',
    },
    {
      label: 'Chat',
      icon: '💬',
      route: '/chat',
    },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((isOpen) => !isOpen);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigateByUrl('/home');
  }
}