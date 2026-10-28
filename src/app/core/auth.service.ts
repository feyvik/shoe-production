import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export type UserRole = 'admin' | 'supervisor' | 'storekeeper';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AppUser | null>(null);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.supabase.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await this.loadProfile(data.user.id);
    return data;
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private async loadProfile(userId: string) {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) this.currentUser.set(data as AppUser);
  }

  isLoggedIn() {
    return !!this.currentUser();
  }

  hasRole(role: UserRole) {
    return this.currentUser()?.role === role;
  }
}
