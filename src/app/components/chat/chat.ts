import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { ChatMessage, ChatService } from '../../services/chat';

@Component({
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private ngZone = inject(NgZone);

  messages = signal<ChatMessage[]>([]);
  messageText = signal('');
  loading = signal(false);
  sending = signal(false);
  error = signal<string | null>(null);
  realtimeStatus = signal('Conectando al chat en tiempo real...');

  currentUser = computed(() => this.authService.currentUser());

  async ngOnInit(): Promise<void> {
    await this.loadMessages();

    this.chatService.subscribeToMessages(
      (message) => {
        this.ngZone.run(() => {
          this.messages.update((messages) => {
            const messageAlreadyExists = messages.some(
              (currentMessage) => currentMessage.id === message.id
            );

            if (messageAlreadyExists) {
              return messages;
            }

            return [...messages, message];
          });
        });
      },
      (status) => {
        this.ngZone.run(() => {
          this.realtimeStatus.set(`Realtime: ${status}`);
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.chatService.unsubscribeFromMessages();
  }

  async loadMessages(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const messages = await this.chatService.getMessages();

    this.messages.set(messages);
    this.loading.set(false);
  }

  async sendMessage(): Promise<void> {
    const user = this.currentUser();
    const message = this.messageText().trim();

    if (!user || !message || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.error.set(null);

    const sent = await this.chatService.sendMessage({
      userId: user.id,
      userEmail: user.email ?? null,
      userName: this.authService.userDisplayName(),
      message,
    });

    this.sending.set(false);

    if (!sent) {
      this.error.set('No se pudo enviar el mensaje.');
      return;
    }

    this.messageText.set('');
  }

  updateMessageText(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.messageText.set(input.value);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.user_id === this.currentUser()?.id;
  }

  getSenderName(message: ChatMessage): string {
    return message.user_name || message.user_email || 'Usuario';
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}