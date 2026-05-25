import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface GameCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  status: 'available' | 'coming-soon';
}

@Component({
  selector: 'app-juegos',
  imports: [CommonModule, RouterLink],
  templateUrl: './juegos.html',
  styleUrl: './juegos.css',
})
export class Juegos {
  games: GameCard[] = [
    {
      title: 'Ahorcado Argentino',
      description:
        'Adiviná palabras relacionadas con historia, cultura y geografía argentina antes de quedarte sin intentos.',
      icon: '🇦🇷',
      route: '/juegos/ahorcado',
      status: 'available',
    },
    {
      title: 'Mayor o Menor',
      description:
        'Adiviná si la próxima carta de la baraja española será mayor o menor que la carta actual.',
      icon: '🃏',
      route: '/juegos/mayor-menor',
      status: 'available',
    },
    {
      title: 'Preguntados',
      description:
        'Juego de preguntas y respuestas que se incorporará en una próxima etapa del proyecto.',
      icon: '❓',
      route: '/juegos',
      status: 'coming-soon',
    },
    {
      title: 'Sonido o Símbolo',
      description:
        'Juego propio con referencias argentinas, sonidos, símbolos y desafíos visuales.',
      icon: '🎧',
      route: '/juegos',
      status: 'coming-soon',
    },
  ];

  availableGames = this.games.filter((game) => game.status === 'available');
  comingSoonGames = this.games.filter((game) => game.status === 'coming-soon');
}