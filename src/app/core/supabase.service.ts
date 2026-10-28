import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  client: SupabaseClient;

  configured = environment.supabaseUrl.startsWith('http');

  constructor() {
    const url = this.configured ? environment.supabaseUrl : 'https://placeholder.supabase.co';
    this.client = createClient(url, environment.supabaseKey || 'placeholder');
  }
}
