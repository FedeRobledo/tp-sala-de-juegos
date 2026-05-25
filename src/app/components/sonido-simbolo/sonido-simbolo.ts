import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GameResultsService } from '../../services/game-results';

interface OwnGameRound {
  soundDescription: string;
  soundUrl: string;
  imageUrl: string;
  correctAnswer: string;
  validAnswers: string[];
}

interface AnsweredRound {
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
  private nextRoundTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private audioLimitTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  private readonly allRounds: OwnGameRound[] = [
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/asado.mp3',
      imageUrl: '/assets/images/asado.png',
      correctAnswer: 'Asado',
      validAnswers: ['asado', 'el asado'],
    },
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/bandoneon.mp3',
      imageUrl: '/assets/images/bandoneon.png',
      correctAnswer: 'Bandoneón',
      validAnswers: ['bandoneon', 'bandoneón'],
    },
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/bombo-leguero.mp3',
      imageUrl: '/assets/images/bombo-leguero.png',
      correctAnswer: 'Bombo legüero',
      validAnswers: ['bombo leguero', 'bombo legüero'],
    },
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/cartas.mp3',
      imageUrl: '/assets/images/truco.png',
      correctAnswer: 'Truco',
      validAnswers: ['truco', 'el truco'],
    },
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/futbol.mp3',
      imageUrl: '/assets/images/futbol.png',
      correctAnswer: 'Hinchada',
      validAnswers: ['aliento', 'hinchada', 'tribuna'],
    },
    {
      soundDescription: 'Escuchá el sonido.',
      soundUrl: '/assets/sounds/mate.mp3',
      imageUrl: '/assets/images/mate.png',
      correctAnswer: 'Mate',
      validAnswers: ['mate', 'el mate'],
    },
  ];

  rounds = signal<OwnGameRound[]>([]);
  currentIndex = signal(0);

  selectedAnswer = signal<string | null>(null);
  typedAnswer = signal('');
  soundPlayed = signal(false);
  audioPlaying = signal(false);
  visualHelpUsed = signal(false);
  audioError = signal(false);

  finished = signal(false);
  elapsedSeconds = signal(0);

  correctAnswers = signal(0);
  wrongAnswers = signal(0);
  usedHelps = signal(0);
  answeredRounds = signal<AnsweredRound[]>([]);

  resultSaved = signal(false);
  savingResult = signal(false);
  saveResultError = signal<string | null>(null);

  currentRound = computed(() => this.rounds()[this.currentIndex()] ?? null);

  totalRounds = computed(() => this.rounds().length);

  currentRoundNumber = computed(() => {
    if (this.totalRounds() === 0) {
      return 0;
    }

    return this.currentIndex() + 1;
  });

  score = computed(() => {
    return this.answeredRounds().reduce((total, round) => total + round.points, 0);
  });

  won = computed(() => this.correctAnswers() >= 3);

  canAnswer = computed(() => {
    return this.typedAnswer().trim().length > 0 && this.selectedAnswer() === null;
  });

  ngOnInit(): void {
    this.startGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.clearNextRoundTimeout();
    this.stopCurrentAudio();
  }

  startGame(): void {
    this.stopTimer();
    this.clearNextRoundTimeout();
    this.stopCurrentAudio();

    this.rounds.set(this.getRandomRounds());
    this.currentIndex.set(0);

    this.selectedAnswer.set(null);
    this.typedAnswer.set('');
    this.soundPlayed.set(false);
    this.audioPlaying.set(false);
    this.visualHelpUsed.set(false);
    this.audioError.set(false);

    this.finished.set(false);
    this.elapsedSeconds.set(0);

    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
    this.usedHelps.set(0);
    this.answeredRounds.set([]);

    this.resultSaved.set(false);
    this.savingResult.set(false);
    this.saveResultError.set(null);

    this.startTimer();
  }

  playSound(): void {
    const round = this.currentRound();

    if (!round || this.selectedAnswer()) {
      return;
    }

    this.stopCurrentAudio();
    this.audioError.set(false);

    this.currentAudio = new Audio(round.soundUrl);
    this.currentAudio.currentTime = 0;

    this.currentAudio.addEventListener(
      'ended',
      () => {
        this.audioPlaying.set(false);
      },
      { once: true },
    );

    this.currentAudio
      .play()
      .then(() => {
        this.soundPlayed.set(true);
        this.audioPlaying.set(true);

        this.audioLimitTimeoutId = setTimeout(() => {
          this.stopCurrentAudio();
        }, 5000);
      })
      .catch(() => {
        this.audioError.set(true);
        this.audioPlaying.set(false);
        this.stopCurrentAudio();
      });
  }

  useVisualHelp(): void {
    if (this.visualHelpUsed() || this.selectedAnswer()) {
      return;
    }

    this.visualHelpUsed.set(true);
    this.usedHelps.update((value) => value + 1);
  }

  updateTypedAnswer(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.typedAnswer.set(input.value);
  }

  submitAnswer(): void {
    const round = this.currentRound();

    if (!round || !this.canAnswer()) {
      return;
    }

    const answer = this.typedAnswer().trim();
    const normalizedAnswer = this.normalizeAnswer(answer);

    const wasCorrect = round.validAnswers.some(
      (validAnswer) => this.normalizeAnswer(validAnswer) === normalizedAnswer,
    );

    const points = wasCorrect ? (this.visualHelpUsed() ? 10 : 20) : 0;

    this.selectedAnswer.set(answer);
    this.stopCurrentAudio();

    if (wasCorrect) {
      this.correctAnswers.update((value) => value + 1);
    } else {
      this.wrongAnswers.update((value) => value + 1);
    }

    this.answeredRounds.update((rounds) => [
      ...rounds,
      {
        correctAnswer: round.correctAnswer,
        typedAnswer: answer,
        wasCorrect,
        usedHelp: this.visualHelpUsed(),
        points,
      },
    ]);

    this.clearNextRoundTimeout();

    this.nextRoundTimeoutId = setTimeout(() => {
      this.goToNextRound();
    }, 1200);
  }

  private goToNextRound(): void {
    this.clearNextRoundTimeout();
    this.stopCurrentAudio();

    const isLastRound = this.currentIndex() >= this.rounds().length - 1;

    if (isLastRound) {
      this.finishGame();
      return;
    }

    this.currentIndex.update((value) => value + 1);
    this.selectedAnswer.set(null);
    this.typedAnswer.set('');
    this.soundPlayed.set(false);
    this.audioPlaying.set(false);
    this.visualHelpUsed.set(false);
    this.audioError.set(false);
  }

  private finishGame(): void {
    this.finished.set(true);
    this.stopTimer();
    this.clearNextRoundTimeout();
    this.stopCurrentAudio();

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
        maxAudioSeconds: 5,
      },
    });

    this.savingResult.set(false);

    if (!saved) {
      this.saveResultError.set('La partida terminó, pero no se pudo guardar el resultado.');
      return;
    }

    this.resultSaved.set(true);
  }

  private startTimer(): void {
    this.stopTimer();

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

  private clearNextRoundTimeout(): void {
    if (!this.nextRoundTimeoutId) {
      return;
    }

    clearTimeout(this.nextRoundTimeoutId);
    this.nextRoundTimeoutId = null;
  }

  private stopCurrentAudio(): void {
    if (this.audioLimitTimeoutId) {
      clearTimeout(this.audioLimitTimeoutId);
      this.audioLimitTimeoutId = null;
    }

    if (!this.currentAudio) {
      this.audioPlaying.set(false);
      return;
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
    this.audioPlaying.set(false);
  }

  private getRandomRounds(): OwnGameRound[] {
    return [...this.allRounds].sort(() => Math.random() - 0.5).slice(0, 5);
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
}