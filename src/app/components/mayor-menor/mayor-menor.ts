import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GameResultsService } from '../../services/game-results';

type Suit = 'Oro' | 'Copa' | 'Espada' | 'Basto';
type Guess = 'mayor' | 'menor';

interface SpanishCard {
  value: number;
  suit: Suit;
}

@Component({
  selector: 'app-mayor-menor',
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css',
})
export class MayorMenor {
  readonly maxRounds = 10;
  readonly maxErrors = 3;

  private readonly suits: Suit[] = ['Oro', 'Copa', 'Espada', 'Basto'];
  private readonly values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);
  resultSaved = signal(false);
  savingResult = signal(false);
  saveResultError = signal<string | null>(null);

  currentCard = signal<SpanishCard>(this.getRandomCard());
  nextCard = signal<SpanishCard | null>(null);

  correctAnswers = signal(0);
  errors = signal(0);
  roundsPlayed = signal(0);

  lastGuess = signal<Guess | null>(null);
  lastResultMessage = signal('Elegí si la próxima carta será mayor o menor.');
  gameFinished = signal(false);
  won = signal(false);
  showResultModal = signal(false);

  startTime = signal(Date.now());
  endTime = signal<number | null>(null);

  remainingRounds = computed(() => this.maxRounds - this.roundsPlayed());
  remainingErrors = computed(() => this.maxErrors - this.errors());

  timeSeconds = computed(() => {
    const end = this.endTime() ?? Date.now();
    return Math.floor((end - this.startTime()) / 1000);
  });

  score = computed(() => {
    const base = this.correctAnswers() * 10;
    const errorPenalty = this.errors() * 5;
    const timePenalty = Math.floor(this.timeSeconds() / 15);

    return Math.max(base - errorPenalty - timePenalty, 0);
  });

  choose(option: Guess): void {
    if (this.gameFinished()) {
      return;
    }

    const current = this.currentCard();
    const next = this.getRandomCardWithDifferentValue(current.value);

    const guessedCorrectly =
      (option === 'mayor' && next.value > current.value) ||
      (option === 'menor' && next.value < current.value);

    this.nextCard.set(next);
    this.lastGuess.set(option);
    this.roundsPlayed.update((rounds) => rounds + 1);

    if (guessedCorrectly) {
      this.correctAnswers.update((answers) => answers + 1);
      this.lastResultMessage.set(`Correcto: salió ${this.cardName(next)}.`);
    } else {
      this.errors.update((errors) => errors + 1);
      this.lastResultMessage.set(`Incorrecto: salió ${this.cardName(next)}.`);
    }

    this.checkGameState(next);
  }

  continueGame(): void {
    if (!this.nextCard() || this.gameFinished()) {
      return;
    }

    this.currentCard.set(this.nextCard() as SpanishCard);
    this.nextCard.set(null);
    this.lastGuess.set(null);
    this.lastResultMessage.set('Elegí si la próxima carta será mayor o menor.');
  }

  newGame(): void {
    this.currentCard.set(this.getRandomCard());
    this.nextCard.set(null);
    this.correctAnswers.set(0);
    this.errors.set(0);
    this.roundsPlayed.set(0);
    this.lastGuess.set(null);
    this.lastResultMessage.set('Elegí si la próxima carta será mayor o menor.');
    this.gameFinished.set(false);
    this.won.set(false);
    this.showResultModal.set(false);
    this.startTime.set(Date.now());
    this.endTime.set(null);
    this.resultSaved.set(false);
    this.savingResult.set(false);
    this.saveResultError.set(null);
  }

  closeModal(): void {
    this.showResultModal.set(false);
  }

  cardName(card: SpanishCard): string {
    return `${card.value} de ${card.suit}`;
  }

  suitIcon(suit: Suit): string {
    const icons: Record<Suit, string> = {
      Oro: '🟡',
      Copa: '🏆',
      Espada: '⚔️',
      Basto: '🌿',
    };

    return icons[suit];
  }

  private async saveGameResult(): Promise<void> {
  if (this.resultSaved() || this.savingResult()) {
    return;
  }

  const user = this.authService.currentUser();

  if (!user) {
    this.saveResultError.set('No se pudo guardar el resultado porque no hay usuario logueado.');
    return;
  }

  this.savingResult.set(true);
  this.saveResultError.set(null);

  const saved = await this.gameResultsService.saveResult({
    userId: user.id,
    userEmail: user.email ?? null,
    userName: this.authService.userDisplayName(),
    game: 'mayor-menor',
    score: this.score(),
    timeSeconds: this.timeSeconds(),
    won: this.won(),
    details: {
      correctAnswers: this.correctAnswers(),
      errors: this.errors(),
      roundsPlayed: this.roundsPlayed(),
      maxRounds: this.maxRounds,
      maxErrors: this.maxErrors,
      lastGuess: this.lastGuess(),
      finalCard: this.currentCard(),
      deck: 'Baraja española',
    },
  });

  this.savingResult.set(false);

  if (!saved) {
    this.saveResultError.set('La partida terminó, pero no se pudo guardar el resultado.');
    return;
  }

  this.resultSaved.set(true);
}

  private checkGameState(next: SpanishCard): void {
    const reachedRoundLimit = this.roundsPlayed() >= this.maxRounds;
    const reachedErrorLimit = this.errors() >= this.maxErrors;

    if (!reachedRoundLimit && !reachedErrorLimit) {
      return;
    }

    this.currentCard.set(next);
    this.nextCard.set(null);
    this.gameFinished.set(true);
    this.won.set(this.correctAnswers() >= 6 && !reachedErrorLimit);
    this.endTime.set(Date.now());
    this.showResultModal.set(true);
    void this.saveGameResult();
  }

  private getRandomCard(): SpanishCard {
    const value = this.values[Math.floor(Math.random() * this.values.length)];
    const suit = this.suits[Math.floor(Math.random() * this.suits.length)];

    return { value, suit };
  }

  private getRandomCardWithDifferentValue(currentValue: number): SpanishCard {
    let card = this.getRandomCard();
    let attempts = 0;

    while (card.value === currentValue && attempts < 20) {
      card = this.getRandomCard();
      attempts++;
    }

    return card;
  }
}