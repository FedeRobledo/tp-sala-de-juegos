import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GameResultsService } from '../../services/game-results';
import { QuestionsService, TriviaQuestion } from '../../services/questions';

@Component({
  selector: 'app-preguntados',
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados implements OnInit, OnDestroy {
  private questionsService = inject(QuestionsService);
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);

  private timerId: ReturnType<typeof setInterval> | null = null;

  questions = signal<TriviaQuestion[]>([]);
  currentIndex = signal(0);
  selectedOption = signal<string | null>(null);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  finished = signal(false);

  correctAnswers = signal(0);
  wrongAnswers = signal(0);
  elapsedSeconds = signal(0);

  resultSaved = signal(false);
  savingResult = signal(false);
  saveResultError = signal<string | null>(null);

  answeredQuestions = signal<
    {
      question: string;
      category: string;
      difficulty: string;
      selectedAnswer: string;
      correctAnswer: string;
      wasCorrect: boolean;
    }[]
  >([]);

  currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);

  totalQuestions = computed(() => this.questions().length);

  currentQuestionNumber = computed(() => {
    if (this.totalQuestions() === 0) {
      return 0;
    }

    return this.currentIndex() + 1;
  });

  score = computed(() => {
    const base = this.correctAnswers() * 10;
    const timePenalty = Math.floor(this.elapsedSeconds() / 20);

    return Math.max(base - timePenalty, 0);
  });

  won = computed(() => this.correctAnswers() >= 6);

  ngOnInit(): void {
    void this.startGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  async startGame(): Promise<void> {
    this.stopTimer();

    this.loading.set(true);
    this.errorMessage.set(null);
    this.finished.set(false);
    this.currentIndex.set(0);
    this.selectedOption.set(null);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
    this.elapsedSeconds.set(0);
    this.resultSaved.set(false);
    this.savingResult.set(false);
    this.saveResultError.set(null);
    this.answeredQuestions.set([]);

    const questions = await this.questionsService.getTriviaQuestions();

    if (questions.length === 0) {
      this.errorMessage.set('No se pudieron cargar preguntas. Intentá nuevamente en unos segundos.');
      this.questions.set([]);
      this.loading.set(false);
      return;
    }

    this.questions.set(questions);
    this.loading.set(false);
    this.startTimer();
  }

  selectOption(option: string): void {
    const question = this.currentQuestion();

    if (!question || this.selectedOption() || this.finished()) {
      return;
    }

    const wasCorrect = option === question.correctAnswer;

    this.selectedOption.set(option);

    if (wasCorrect) {
      this.correctAnswers.update((value) => value + 1);
    } else {
      this.wrongAnswers.update((value) => value + 1);
    }

    this.answeredQuestions.update((answers) => [
      ...answers,
      {
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        selectedAnswer: option,
        correctAnswer: question.correctAnswer,
        wasCorrect,
      },
    ]);

    setTimeout(() => {
      this.goToNextQuestion();
    }, 850);
  }

  getOptionClass(option: string): string {
    const question = this.currentQuestion();
    const selectedOption = this.selectedOption();

    if (!question || !selectedOption) {
      return '';
    }

    if (option === question.correctAnswer) {
      return 'correct';
    }

    if (option === selectedOption) {
      return 'wrong';
    }

    return 'disabled';
  }

  restartGame(): void {
    void this.startGame();
  }

  private goToNextQuestion(): void {
    const isLastQuestion = this.currentIndex() >= this.questions().length - 1;

    if (isLastQuestion) {
      this.finishGame();
      return;
    }

    this.currentIndex.update((value) => value + 1);
    this.selectedOption.set(null);
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
      game: 'preguntados',
      score: this.score(),
      timeSeconds: this.elapsedSeconds(),
      won: this.won(),
      details: {
        totalQuestions: this.totalQuestions(),
        correctAnswers: this.correctAnswers(),
        wrongAnswers: this.wrongAnswers(),
        answeredQuestions: this.answeredQuestions(),
        source: 'Open Trivia DB',
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