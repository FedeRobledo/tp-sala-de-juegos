import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { QuestionsService, TriviaQuestion } from '../../services/questions';

@Component({
  selector: 'app-preguntados',
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados implements OnInit, OnDestroy {
  private questionsService = inject(QuestionsService);
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

  currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);

  totalQuestions = computed(() => this.questions().length);

  currentQuestionNumber = computed(() => {
    if (this.totalQuestions() === 0) {
      return 0;
    }

    return this.currentIndex() + 1;
  });

  score = computed(() => this.correctAnswers() * 10);

  won = computed(() => this.correctAnswers() >= 6);

  ngOnInit(): void {
    this.startGame();
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

    this.selectedOption.set(option);

    if (option === question.correctAnswer) {
      this.correctAnswers.update((value) => value + 1);
    } else {
      this.wrongAnswers.update((value) => value + 1);
    }

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