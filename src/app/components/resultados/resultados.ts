import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { GameName, GameResult, GameResultsService } from '../../services/game-results';

interface ResultsTable {
  title: string;
  game: GameName;
  description: string;
  results: GameResult[];
}

@Component({
  selector: 'app-resultados',
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  private gameResultsService = inject(GameResultsService);
  private readonly maxResultsPerGame = 5;

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  tables = signal<ResultsTable[]>([
    {
      title: 'Ahorcado Argentino',
      game: 'ahorcado',
      description: 'Top 5 por puntaje, tiempo y resultado de partida.',
      results: [],
    },
    {
      title: 'Mayor o Menor',
      game: 'mayor-menor',
      description: 'Top 5 según aciertos, puntaje y velocidad de finalización.',
      results: [],
    },
    {
      title: 'Preguntados',
      game: 'preguntados',
      description: 'Top 5 de preguntas correctas obtenidas desde la API externa.',
      results: [],
    },
    {
      title: 'Sonido o Símbolo',
      game: 'sonido-simbolo',
      description: 'Top 5 del juego propio según puntaje, ayudas usadas y tiempo.',
      results: [],
    },
  ]);

  totalResults = computed(() =>
    this.tables().reduce((total, table) => total + table.results.length, 0),
  );

  async ngOnInit(): Promise<void> {
    await this.loadResults();
  }

  async loadResults(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const updatedTables = await Promise.all(
        this.tables().map(async (table) => ({
          ...table,
          results: await this.gameResultsService.getResultsByGame(
            table.game,
            this.maxResultsPerGame,
          ),
        })),
      );

      this.tables.set(updatedTables);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      this.errorMessage.set('No se pudieron cargar los resultados. Intentá nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  getPlayerName(result: GameResult): string {
    return result.user_name || result.user_email || 'Jugador';
  }

  getResultLabel(result: GameResult): string {
    return result.won ? 'Victoria' : 'Derrota';
  }

  formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDetails(result: GameResult, game: GameName): string {
    const details = result.details ?? {};

    if (game === 'ahorcado') {
      return this.formatAhorcadoDetails(details);
    }

    if (game === 'mayor-menor') {
      return this.formatMayorMenorDetails(details);
    }

    if (game === 'preguntados') {
      return this.formatPreguntadosDetails(details);
    }

    if (game === 'sonido-simbolo') {
      return this.formatSonidoSimboloDetails(details);
    }

    return '-';
  }

  private formatAhorcadoDetails(details: Record<string, unknown>): string {
    const selectedLettersCount = details['selectedLettersCount'];
    const errors = details['errors'];
    const maxErrors = details['maxErrors'];

    return `Letras: ${this.toDisplayValue(selectedLettersCount)} · Errores: ${this.toDisplayValue(errors)}/${this.toDisplayValue(maxErrors)}`;
  }

  private formatMayorMenorDetails(details: Record<string, unknown>): string {
    const correctAnswers = details['correctAnswers'];
    const errors = details['errors'];
    const roundsPlayed = details['roundsPlayed'];

    return `Aciertos: ${this.toDisplayValue(correctAnswers)} · Errores: ${this.toDisplayValue(errors)} · Rondas: ${this.toDisplayValue(roundsPlayed)}`;
  }

  private formatPreguntadosDetails(details: Record<string, unknown>): string {
    const correctAnswers = details['correctAnswers'];
    const wrongAnswers = details['wrongAnswers'];
    const totalQuestions = details['totalQuestions'];

    return `Correctas: ${this.toDisplayValue(correctAnswers)} · Incorrectas: ${this.toDisplayValue(wrongAnswers)} · Total: ${this.toDisplayValue(totalQuestions)}`;
  }

  private formatSonidoSimboloDetails(details: Record<string, unknown>): string {
    const correctAnswers = details['correctAnswers'];
    const wrongAnswers = details['wrongAnswers'];
    const usedHelps = details['usedHelps'];

    return `Correctas: ${this.toDisplayValue(correctAnswers)} · Incorrectas: ${this.toDisplayValue(wrongAnswers)} · Ayudas: ${this.toDisplayValue(usedHelps)}`;
  }

  private toDisplayValue(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'string') {
      return String(value);
    }

    return '-';
  }
}