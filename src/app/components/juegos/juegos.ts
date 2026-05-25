import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface GameCard {
  title: string;
  description: string;
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
      route: '/juegos/ahorcado',
      status: 'available',
    },
    {
      title: 'Mayor o Menor',
      description:
        'Adiviná si la próxima carta de la baraja española será mayor o menor que la carta actual.',
      route: '/juegos/mayor-menor',
      status: 'available',
    },
    {
      title: 'Preguntados',
      description:
        'Respondé preguntas de cultura general obtenidas desde una API externa y sumá puntos por cada acierto.',
      route: '/juegos/preguntados',
      status: 'available',
    },
    {
      title: 'Sonido o Símbolo',
      description:
        'Leé pistas sobre sonidos, símbolos, lugares y costumbres argentinas, y elegí la referencia correcta.',
      route: '/juegos/sonido-simbolo',
      status: 'available',
    },
  ];

  availableGames = this.games.filter((game) => game.status === 'available');
  comingSoonGames = this.games.filter((game) => game.status === 'coming-soon');
}