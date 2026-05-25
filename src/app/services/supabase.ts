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
}