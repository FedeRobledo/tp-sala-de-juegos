import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getUser(): Observable<GithubUser> {
    return this.http.get<GithubUser>(this.apiUrl);
  }
}