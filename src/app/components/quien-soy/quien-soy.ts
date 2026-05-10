import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Github, GithubUser } from '../../services/github';

@Component({
  selector: 'app-quien-soy',
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy implements OnInit {
  private githubService = inject(Github);

  user = signal<GithubUser | null>(null);
  loading = signal(false);
  error = signal(false);

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.loading.set(true);
    this.error.set(false);
    this.user.set(null);

    this.githubService.getUser().subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al consultar GitHub:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}