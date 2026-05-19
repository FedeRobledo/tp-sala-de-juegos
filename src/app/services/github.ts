import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Github {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.github.com/users/FedeRobledo';

  user = signal<GithubUser | null>(null);
  loading = signal(false);
  error = signal(false);

  loadUser(): void {
    this.loading.set(true);
    this.error.set(false);
    this.user.set(null);

    this.http.get<GithubUser>(this.apiUrl).subscribe({
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