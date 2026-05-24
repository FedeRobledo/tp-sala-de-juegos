import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

export type GameName = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'juego-propio';

export interface GameResult {
  id?: string;
  user_id: string;
  user_email?: string | null;
  user_name?: string | null;
  game: GameName;
  score: number;
  time_seconds: number;
  won: boolean;
  details?: Record<string, unknown> | null;
  created_at?: string;
}

export interface SaveGameResultData {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  game: GameName;
  score: number;
  timeSeconds: number;
  won: boolean;
  details?: Record<string, unknown> | null;
}

@Injectable({
  providedIn: 'root',
})
export class GameResultsService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getClient();

  async saveResult(result: SaveGameResultData): Promise<boolean> {
    const { error } = await this.supabase.from('game_results').insert({
      user_id: result.userId,
      user_email: result.userEmail ?? null,
      user_name: result.userName ?? null,
      game: result.game,
      score: result.score,
      time_seconds: result.timeSeconds,
      won: result.won,
      details: result.details ?? null,
    });

    if (error) {
      console.error('Error al guardar resultado del juego:', error.message);
      return false;
    }

    return true;
  }

  async getResultsByGame(game: GameName): Promise<GameResult[]> {
    const { data, error } = await this.supabase
      .from('game_results')
      .select('*')
      .eq('game', game)
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true });

    if (error) {
      console.error('Error al obtener resultados del juego:', error.message);
      return [];
    }

    return (data ?? []) as GameResult[];
  }

  async getRecentResults(limit = 10): Promise<GameResult[]> {
    const { data, error } = await this.supabase
      .from('game_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error al obtener resultados recientes:', error.message);
      return [];
    }

    return (data ?? []) as GameResult[];
  }
}