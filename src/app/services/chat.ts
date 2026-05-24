import { Injectable, inject } from '@angular/core';
import { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';
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
  private channel: RealtimeChannel | null = null;

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

subscribeToMessages(
  onNewMessage: (message: ChatMessage) => void,
  onStatusChange?: (status: string) => void
): void {
  this.unsubscribeFromMessages();

  console.log('Iniciando suscripción realtime a chat_messages...');

  this.channel = this.supabase
    .channel(`chat_messages_channel_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        console.log('Evento realtime recibido:', payload);

        if (payload.eventType === 'INSERT') {
          onNewMessage(payload.new as ChatMessage);
        }
      }
    )
    .subscribe((status, error) => {
      console.log('Estado realtime chat:', status);
      console.log('Error realtime chat:', error);

      onStatusChange?.(status);
    });
}

  unsubscribeFromMessages(): void {
    if (!this.channel) {
      return;
    }

    void this.supabase.removeChannel(this.channel);
    this.channel = null;
  }
}