import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface OpenTriviaResponse {
  response_code: number;
  results: OpenTriviaQuestion[];
}

interface OpenTriviaQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaQuestion {
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';

  async getTriviaQuestions(): Promise<TriviaQuestion[]> {
    try {
      const response = await firstValueFrom(this.http.get<OpenTriviaResponse>(this.apiUrl));

      if (response.response_code !== 0) {
        console.error('Open Trivia respondió sin preguntas disponibles:', response.response_code);
        return [];
      }

      return response.results.map((question) => this.mapQuestion(question));
    } catch (error) {
      console.error('Error al obtener preguntas de Open Trivia:', error);
      return [];
    }
  }

  private mapQuestion(question: OpenTriviaQuestion): TriviaQuestion {
    const correctAnswer = this.decodeHtml(question.correct_answer);

    const incorrectAnswers = question.incorrect_answers.map((answer) => this.decodeHtml(answer));

    return {
      category: this.decodeHtml(question.category),
      difficulty: this.decodeHtml(question.difficulty),
      question: this.decodeHtml(question.question),
      correctAnswer,
      options: this.shuffleOptions([correctAnswer, ...incorrectAnswers]),
    };
  }

  private shuffleOptions(options: string[]): string[] {
    return [...options].sort(() => Math.random() - 0.5);
  }

  private decodeHtml(value: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = value;
    return textArea.value;
  }
}