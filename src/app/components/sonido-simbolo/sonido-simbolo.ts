import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GameResultsService } from '../../services/game-results';

interface OwnGameRound {
  soundTitle: string;
  soundDescription: string;
  soundUrl: string;
  imageUrl: string;
  visualHelp: string;
  correctAnswer: string;
  validAnswers: string[];
}

interface AnsweredRound {
  round: number;
  soundTitle: string;
  correctAnswer: string;
  typedAnswer: string;
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
  private currentAudio: HTMLAudioElement | null = null;

  private readonly allRounds: OwnGameRound[] = [
    {
      soundTitle: 'Pista sonora 1',
      soundDescription: 'Escuchá con atención el ambiente y pensá en una comida argentina muy típica.',
      soundUrl: '/assets/sounds/asado.mp3',
      imageUrl: '/assets/images/asado.png',
      visualHelp: 'Se revela una figura asociada a fuego, brasas y parrilla.',
      correctAnswer: 'Asado',
      validAnswers: ['asado', 'el asado'],
    },
    {
      soundTitle: 'Pista sonora 2',
      soundDescription: 'Escuchá el instrumento y pensá en una expresión musical argentina muy reconocida.',
      soundUrl: '/assets/sounds/bandoneon.mp3',
      imageUrl: '/assets/images/bandoneon.png',
      visualHelp: 'Se revela una figura asociada a un instrumento usado en el tango.',
      correctAnswer: 'Bandoneón',
      validAnswers: ['bandoneon', 'bandoneón'],
    },
    {
      soundTitle: 'Pista sonora 3',
      soundDescription: 'Escuchá la percusión y pensá en una referencia del folklore argentino.',
      soundUrl: '/assets/sounds/bombo-leguero.mp3',
      imageUrl: '/assets/images/bombo-leguero.png',
      visualHelp: 'Se revela una figura asociada a un instrumento de percusión tradicional.',
      correctAnswer: 'Bombo legüero',
      validAnswers: ['bombo leguero', 'bombo legüero', 'bombo'],
    },
    {
      soundTitle: 'Pista sonora 4',
      soundDescription: 'Escuchá el sonido de mesa y pensá en un juego muy popular en Argentina.',
      soundUrl: '/assets/sounds/cartas.mp3',
      imageUrl: '/assets/images/truco.png',
      visualHelp: 'Se revela una figura asociada a cartas españolas.',
      correctAnswer: 'Truco',
      validAnswers: ['truco', 'el truco'],
    },
    {
      soundTitle: 'Pista sonora 5',
      soundDescription: 'Escuchá el ambiente y pensá en una pasión popular argentina.',
      soundUrl: '/assets/sounds/futbol.mp3',
      imageUrl: '/assets/images/futbol.png',
      visualHelp: 'Se revela una figura asociada a pelota, cancha y tribuna.',
      correctAnswer: 'Fútbol',
      validAnswers: ['futbol', 'fútbol', 'futbol argentino', 'fútbol argentino'],
    },
    {
      soundTitle: 'Pista sonora 6',
      soundDescription: 'Escuchá el sonido y pensá en una costumbre cotidiana argentina.',
      soundUrl: '/assets/sounds/mate.mp3',
      imageUrl: '/assets/images/mate.png',
      visualHelp: 'Se revela una figura asociada a una infusión tradicional.',
      correctAnswer: 'Mate',
      validAnswers: ['mate', 'el mate'],
    },
  ];

  rounds = signal<OwnGameRound[]>([]);
  currentIndex = signal(0);

  typedAnswer = signal('');
  selectedAnswer = signal<string | null>(null);

  soundPlayed = signal(false);
  visualHelpUsed = signal(false);
  finished = signal(false);
  audioError = signal(false);

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

  canAnswer = computed(() => this.typedAnswer().trim().length > 0 && !this.selectedAnswer());

  ngOnInit(): void {
    this.startGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopAudio();
  }

  startGame(): void {
    this.stopTimer();
    this.stopAudio();

    this.rounds.set(this.getRandomRounds());
    this.currentIndex.set(0);

    this.typedAnswer.set('');
    this.selectedAnswer.set(null);
    this.soundPlayed.set(false);
    this.visualHelpUsed.set(false);
    this.finished.set(false);
    this.audioError.set(false);

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

  updateTypedAnswer(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.typedAnswer.set(input.value);
  }

  playSound(): void {
    const round = this.currentRound();

    if (!round || this.selectedAnswer()) {
      return;
    }

    this.stopAudio();
    this.soundPlayed.set(true);
    this.audioError.set(false);

    this.currentAudio = new Audio(round.soundUrl);
    this.currentAudio.volume = 0.85;

    this.currentAudio.play().catch((error) => {
      console.error('No se pudo reproducir el sonido:', error);
      this.audioError.set(true);
    });
  }

  useVisualHelp(): void {
    if (this.visualHelpUsed() || this.selectedAnswer()) {
      return;
    }

    this.visualHelpUsed.set(true);
    this.usedHelps.update((value) => value + 1);
  }

  submitAnswer(): void {
    const round = this.currentRound();
    const answer = this.typedAnswer().trim();

    if (!round || !answer || this.selectedAnswer() || this.finished()) {
      return;
    }

    this.stopAudio();

    const wasCorrect = this.isCorrectAnswer(answer, round.validAnswers);
    const points = this.getRoundPoints(wasCorrect);

    this.selectedAnswer.set(answer);

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
        typedAnswer: answer,
        wasCorrect,
        usedHelp: this.visualHelpUsed(),
        points,
      },
    ]);

    setTimeout(() => {
      this.goToNextRound();
    }, 1200);
  }

  private isCorrectAnswer(answer: string, validAnswers: string[]): boolean {
    const normalizedAnswer = this.normalizeAnswer(answer);

    return validAnswers.some((validAnswer) => this.normalizeAnswer(validAnswer) === normalizedAnswer);
  }

  private normalizeAnswer(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9ñ\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
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
    this.typedAnswer.set('');
    this.selectedAnswer.set(null);
    this.soundPlayed.set(false);
    this.visualHelpUsed.set(false);
    this.audioError.set(false);
  }

  private finishGame(): void {
    this.finished.set(true);
    this.stopTimer();
    this.stopAudio();
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
        usesRealAssets: true,
        answerMode: 'typed-one-attempt',
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
    return [...this.allRounds].sort(() => Math.random() - 0.5).slice(0, 5);
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

  private stopAudio(): void {
    if (!this.currentAudio) {
      return;
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
  }
}