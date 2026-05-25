import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Github } from '../../services/github';

@Component({
  selector: 'app-quien-soy',
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy implements OnInit {
  private githubService = inject(Github);

  user = this.githubService.user;
  loading = this.githubService.loading;
  error = this.githubService.error;

  ngOnInit(): void {
    this.githubService.loadUser();
  }
}