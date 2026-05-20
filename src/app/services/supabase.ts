import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // TODO: Solo para probar despues borrarlo y sacarlo de layout !!!
  async testConnection(): Promise<void> {
    const { error, count } = await this.client
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error al conectar con Supabase:', error.message);
      return;
    }

    console.log('Conexión con Supabase OK. Tabla profiles disponible.', {
      cantidadDeRegistros: count,
    });
  }
}