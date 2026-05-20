import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';
import { LoginData, RegisterData, UserProfile } from '../models/user-profile';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.getClient();

  currentUser = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isLoggedIn = computed(() => this.currentUser() !== null);

  userDisplayName = computed(() => {
    const profile = this.profile();

    if (profile) {
      return `${profile.nombre} ${profile.apellido}`;
    }

    return this.currentUser()?.email ?? '';
  });

  constructor() {
    this.loadSession();
    this.listenAuthChanges();
  }

  async login(data: LoginData): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        this.error.set(this.getErrorMessage(error.message));
        return false;
      }

      if (!authData.user) {
        this.error.set('No se pudo iniciar sesión.');
        return false;
      }

      this.currentUser.set(authData.user);
      await this.loadProfile(authData.user.id);

      return true;
    } catch (err) {
      console.error('Error inesperado en login:', err);
      this.error.set('Ocurrió un error inesperado al iniciar sesión.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async register(data: RegisterData): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        this.error.set(this.getErrorMessage(error.message));
        return false;
      }

      if (!authData.user) {
        this.error.set('No se pudo crear el usuario.');
        return false;
      }

      const { data: sessionData } = await this.supabase.auth.getSession();

      if (!sessionData.session) {
        this.error.set(
          'El usuario fue creado, pero debe confirmar el correo antes de iniciar sesión.'
        );
        return false;
      }

      const profile: UserProfile = {
        id: authData.user.id,
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
      };

      const { error: profileError } = await this.supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (profileError) {
        console.error('Error al guardar perfil:', profileError);
        this.error.set(this.getErrorMessage(profileError.message));
        return false;
      }

      this.currentUser.set(authData.user);
      this.profile.set(profile);

      return true;
    } catch (err) {
      console.error('Error inesperado en register:', err);
      this.error.set('Ocurrió un error inesperado al registrar el usuario.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        this.error.set(this.getErrorMessage(error.message));
        return;
      }

      this.currentUser.set(null);
      this.profile.set(null);
    } catch (err) {
      console.error('Error inesperado en logout:', err);
      this.error.set('Ocurrió un error inesperado al cerrar sesión.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadSession(): Promise<void> {
    this.loading.set(true);

    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        this.currentUser.set(null);
        this.profile.set(null);
        return;
      }

      const user = data.session?.user ?? null;
      this.currentUser.set(user);

      if (user) {
        await this.loadProfile(user.id);
      } else {
        this.profile.set(null);
      }
    } catch (err) {
      console.error('Error inesperado al cargar sesión:', err);
      this.currentUser.set(null);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private listenAuthChanges(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;

      this.currentUser.set(user);

      if (!user) {
        this.profile.set(null);
        return;
      }

      setTimeout(() => {
        this.loadProfile(user.id);
      }, 0);
    });
  }

  private async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error al cargar perfil:', error.message);
      this.profile.set(null);
      return;
    }

    this.profile.set((data as UserProfile | null) ?? null);
  }

  private getErrorMessage(message: string): string {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('invalid login credentials')) {
      return 'El correo o la contraseña son incorrectos.';
    }

    if (normalizedMessage.includes('user already registered')) {
      return 'El usuario ya se encuentra registrado.';
    }

    if (normalizedMessage.includes('email rate limit exceeded')) {
      return 'Se realizaron demasiados intentos. Probá nuevamente más tarde.';
    }

    if (normalizedMessage.includes('password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (normalizedMessage.includes('duplicate key')) {
      return 'El usuario ya se encuentra registrado.';
    }

    if (normalizedMessage.includes('row-level security')) {
      return 'No se pudo guardar el perfil por una política de seguridad de Supabase.';
    }

    return message;
  }
}