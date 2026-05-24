import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

export interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  message: string;
  created_at: string;
}

export interface SendChatMessageData {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getClient();

  async getMessages(): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error al obtener mensajes del chat:', error.message);
      return [];
    }

    return (data ?? []) as ChatMessage[];
  }

  async sendMessage(messageData: SendChatMessageData): Promise<boolean> {
    const cleanMessage = messageData.message.trim();

    if (!cleanMessage) {
      return false;
    }

    const { error } = await this.supabase.from('chat_messages').insert({
      user_id: messageData.userId,
      user_email: messageData.userEmail ?? null,
      user_name: messageData.userName ?? null,
      message: cleanMessage,
    });

    if (error) {
      console.error('Error al enviar mensaje:', error.message);
      return false;
    }

    return true;
  }
}