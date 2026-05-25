import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GameResultsService } from '../../services/game-results';

interface OwnGameRound {
  soundTitle: string;
  soundDescription: string;
  hiddenImageMock: string;
  visualHelp: string;
  correctAnswer: string;
  options: string[];
}

interface AnsweredRound {
  round: number;
  soundTitle: string;
  correctAnswer: string;
  selectedAnswer: string;
  wasCorrect: boolean;
  usedHelp: boolean;
  points: number;
}

@Component({
  selector: 'app-sonido-simbolo',
  imports: [CommonModule],
  templateUrl: './sonido-simbolo.html',
  styleUrl: './sonido-simbolo.css',
})
export class SonidoSimbolo implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);

  private timerId: ReturnType<typeof setInterval> | null = null;

  private readonly allRounds: OwnGameRound[] = [
    {
      soundTitle: 'Ambiente de cancha',
      soundDescription: 'Se escucha una hinchada cantando con bombos de fondo.',
      hiddenImageMock: '⚽',
      visualHelp: 'Se revela parte de una pelota y una tribuna.',
      correctAnswer: 'Fútbol argentino',
      options: ['Tango', 'Fútbol argentino', 'Folklore'],
    },
    {
      soundTitle: 'Ronda de mate',
      soundDescription: 'Se escucha agua caliente cayendo sobre yerba.',
      hiddenImageMock: '🧉',
      visualHelp: 'Se revela parte de un mate con bombilla.',
      correctAnswer: 'Mate',
      options: ['Mate', 'Asado', 'Empanadas'],
    },
    {
      soundTitle: 'Música ciudadana',
      soundDescription: 'Se escucha una melodía de tango interpretada con bandoneón.',
      hiddenImageMock: '🎵',
      visualHelp: 'Se revela parte de un instrumento asociado al tango.',
      correctAnswer: 'Bandoneón',
      options: ['Bombo legüero', 'Bandoneón', 'Charango'],
    },
    {
      soundTitle: 'Mesa de cartas',
      soundDescription: 'Se escuchan cartas sobre la mesa y una voz cantando truco.',
      hiddenImageMock: '🃏',
      visualHelp: 'Se revela parte de una baraja española.',
      correctAnswer: 'Truco',
      options: ['Truco', 'Generala', 'Chinchón'],
    },
    {
      soundTitle: 'Brasas encendidas',
      soundDescription: 'Se escucha fuego, brasas y carne cocinándose en una parrilla.',
      hiddenImageMock: '🔥',
      visualHelp: 'Se revela parte de una parrilla con brasas.',
      correctAnswer: 'Asado',
      options: ['Locro', 'Asado', 'Milanesa'],
    },
    {
      soundTitle: 'Acto patrio',
      soundDescription: 'Se escucha música de acto escolar y una referencia patria.',
      hiddenImageMock: '🇦🇷',
      visualHelp: 'Se revelan colores celeste y blanco.',
      correctAnswer: 'Escarapela',
      options: ['Escarapela', 'Obelisco', 'Cabildo'],
    },
  ];

  rounds = signal<OwnGameRound[]>([]);
  currentIndex = signal(0);
  selectedOption = signal<string | null>(null);

  soundPlayed = signal(false);
  visualHelpUsed = signal(false);
  finished = signal(false);

  correctAnswers = signal(0);
  wrongAnswers = signal(0);
  usedHelps = signal(0);
  elapsedSeconds = signal(0);
  score = signal(0);

  resultSaved = signal(false);
  savingResult = signal(false);
  saveResultError = signal<string | null>(null);

  answeredRounds = signal<AnsweredRound[]>([]);

  currentRound = computed(() => this.rounds()[this.currentIndex()] ?? null);

  totalRounds = computed(() => this.rounds().length);

  currentRoundNumber = computed(() => {
    if (this.totalRounds() === 0) {
      return 0;
    }

    return this.currentIndex() + 1;
  });

  won = computed(() => this.correctAnswers() >= 3);

  ngOnInit(): void {
    this.startGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startGame(): void {
    this.stopTimer();

    this.rounds.set(this.getRandomRounds());
    this.currentIndex.set(0);
    this.selectedOption.set(null);
    this.soundPlayed.set(false);
    this.visualHelpUsed.set(false);
    this.finished.set(false);

    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
    this.usedHelps.set(0);
    this.elapsedSeconds.set(0);
    this.score.set(0);
    this.answeredRounds.set([]);

    this.resultSaved.set(false);
    this.savingResult.set(false);
    this.saveResultError.set(null);

    this.startTimer();
  }

  playSound(): void {
    if (this.selectedOption()) {
      return;
    }

    this.soundPlayed.set(true);
  }

  useVisualHelp(): void {
    if (this.visualHelpUsed() || this.selectedOption()) {
      return;
    }

    this.visualHelpUsed.set(true);
    this.usedHelps.update((value) => value + 1);
  }

  selectOption(option: string): void {
    const round = this.currentRound();

    if (!round || this.selectedOption() || this.finished()) {
      return;
    }

    const wasCorrect = option === round.correctAnswer;
    const points = this.getRoundPoints(wasCorrect);

    this.selectedOption.set(option);

    if (wasCorrect) {
      this.correctAnswers.update((value) => value + 1);
      this.score.update((value) => value + points);
    } else {
      this.wrongAnswers.update((value) => value + 1);
    }

    this.answeredRounds.update((answers) => [
      ...answers,
      {
        round: this.currentRoundNumber(),
        soundTitle: round.soundTitle,
        correctAnswer: round.correctAnswer,
        selectedAnswer: option,
        wasCorrect,
        usedHelp: this.visualHelpUsed(),
        points,
      },
    ]);

    setTimeout(() => {
      this.goToNextRound();
    }, 900);
  }

  getOptionClass(option: string): string {
    const round = this.currentRound();
    const selectedOption = this.selectedOption();

    if (!round || !selectedOption) {
      return '';
    }

    if (option === round.correctAnswer) {
      return 'correct';
    }

    if (option === selectedOption) {
      return 'wrong';
    }

    return 'disabled';
  }

  private getRoundPoints(wasCorrect: boolean): number {
    if (!wasCorrect) {
      return 0;
    }

    return this.visualHelpUsed() ? 10 : 20;
  }

  private goToNextRound(): void {
    const isLastRound = this.currentIndex() >= this.rounds().length - 1;

    if (isLastRound) {
      this.finishGame();
      return;
    }

    this.currentIndex.update((value) => value + 1);
    this.selectedOption.set(null);
    this.soundPlayed.set(false);
    this.visualHelpUsed.set(false);
  }

  private finishGame(): void {
    this.finished.set(true);
    this.stopTimer();
    void this.saveGameResult();
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
      game: 'sonido-simbolo',
      score: this.score(),
      timeSeconds: this.elapsedSeconds(),
      won: this.won(),
      details: {
        gameName: 'Sonido o Símbolo',
        totalRounds: this.totalRounds(),
        correctAnswers: this.correctAnswers(),
        wrongAnswers: this.wrongAnswers(),
        usedHelps: this.usedHelps(),
        maxPointsPerRoundWithoutHelp: 20,
        maxPointsPerRoundWithHelp: 10,
        answeredRounds: this.answeredRounds(),
        mockMode: true,
      },
    });

    this.savingResult.set(false);

    if (!saved) {
      this.saveResultError.set('La partida terminó, pero no se pudo guardar el resultado.');
      return;
    }

    this.resultSaved.set(true);
  }

  private getRandomRounds(): OwnGameRound[] {
    return [...this.allRounds]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((round) => ({
        ...round,
        options: [...round.options].sort(() => Math.random() - 0.5),
      }));
  }

  private startTimer(): void {
    this.timerId = setInterval(() => {
      this.elapsedSeconds.update((value) => value + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (!this.timerId) {
      return;
    }

    clearInterval(this.timerId);
    this.timerId = null;
  }
}