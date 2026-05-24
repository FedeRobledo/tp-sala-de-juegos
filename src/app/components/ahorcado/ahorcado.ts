import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface HangmanWord {
  word: string;
  hint: string;
  category: string;
}

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado {
  readonly maxErrors = 6;

  private readonly words: HangmanWord[] = [
    {
      word: 'BELGRANO',
      hint: 'Prócer argentino relacionado con la creación de la bandera.',
      category: 'Historia',
    },
    {
      word: 'SANMARTIN',
      hint: 'Libertador de Argentina, Chile y Perú.',
      category: 'Historia',
    },
    {
      word: 'TUCUMAN',
      hint: 'Provincia donde se declaró la Independencia argentina.',
      category: 'Historia',
    },
    {
      word: 'MALVINAS',
      hint: 'Islas del Atlántico Sur reclamadas por Argentina.',
      category: 'Geografía',
    },
    {
      word: 'USHUAIA',
      hint: 'Ciudad argentina conocida como la más austral del mundo.',
      category: 'Geografía',
    },
    {
      word: 'CHACARERA',
      hint: 'Danza folklórica tradicional argentina.',
      category: 'Cultura',
    },
    {
      word: 'MATE',
      hint: 'Infusión muy representativa de la cultura argentina.',
      category: 'Cultura',
    },
    {
      word: 'OBELISCO',
      hint: 'Monumento emblemático ubicado en la Ciudad de Buenos Aires.',
      category: 'Cultura',
    },
    {
      word: 'SALTA',
      hint: 'Provincia argentina conocida como “La Linda”.',
      category: 'Geografía',
    },
    {
      word: 'ACONCAGUA',
      hint: 'Montaña más alta de América, ubicada en Mendoza.',
      category: 'Geografía',
    },
  ];

  readonly letters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'Ñ',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  currentWord = signal<HangmanWord>(this.getRandomWord());
  selectedLetters = signal<string[]>([]);
  errors = signal(0);
  gameFinished = signal(false);
  won = signal(false);
  showResultModal = signal(false);
  startTime = signal(Date.now());
  endTime = signal<number | null>(null);

  displayedWord = computed(() => {
    const selected = this.selectedLetters();
    const word = this.currentWord().word;

    return word
      .split('')
      .map((letter) => (selected.includes(letter) ? letter : '_'))
      .join(' ');
  });

  remainingAttempts = computed(() => this.maxErrors - this.errors());

  selectedCount = computed(() => this.selectedLetters().length);

  timeSeconds = computed(() => {
    const end = this.endTime() ?? Date.now();
    return Math.floor((end - this.startTime()) / 1000);
  });

  score = computed(() => {
    if (!this.won()) {
      return 0;
    }

    const baseScore = 100;
    const errorPenalty = this.errors() * 10;
    const letterPenalty = Math.max(this.selectedLetters().length - this.currentWord().word.length, 0) * 2;
    const timePenalty = Math.floor(this.timeSeconds() / 10);

    return Math.max(baseScore - errorPenalty - letterPenalty - timePenalty, 10);
  });

  selectLetter(letter: string): void {
    if (this.gameFinished() || this.selectedLetters().includes(letter)) {
      return;
    }

    this.selectedLetters.update((letters) => [...letters, letter]);

    if (!this.currentWord().word.includes(letter)) {
      this.errors.update((errors) => errors + 1);
    }

    this.checkGameState();
  }

  isSelected(letter: string): boolean {
    return this.selectedLetters().includes(letter);
  }

  isCorrect(letter: string): boolean {
    return this.currentWord().word.includes(letter);
  }

  newGame(): void {
    this.currentWord.set(this.getRandomWord());
    this.selectedLetters.set([]);
    this.errors.set(0);
    this.gameFinished.set(false);
    this.won.set(false);
    this.showResultModal.set(false);
    this.startTime.set(Date.now());
    this.endTime.set(null);
  }

  closeModal(): void {
    this.showResultModal.set(false);
  }

  private checkGameState(): void {
    const word = this.currentWord().word;
    const selected = this.selectedLetters();

    const completedWord = word.split('').every((letter) => selected.includes(letter));
    const lostGame = this.errors() >= this.maxErrors;

    if (!completedWord && !lostGame) {
      return;
    }

    this.gameFinished.set(true);
    this.won.set(completedWord);
    this.endTime.set(Date.now());
    this.showResultModal.set(true);
  }

  private getRandomWord(): HangmanWord {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  }
}