import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

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
export class Layout implements OnInit {
  private supabaseService = inject(SupabaseService);

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
      route: '/home',
    },
    {
      label: 'Resultados',
      icon: '🏆',
      route: '/home',
    },
    {
      label: 'Chat',
      icon: '💬',
      route: '/home',
    },
  ];

  ngOnInit(): void {
    this.supabaseService.testConnection();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((isOpen) => !isOpen);
  }
}