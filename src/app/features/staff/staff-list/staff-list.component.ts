import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-staff-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent implements OnInit {
  staff = signal<any[]>([]);
  loading = signal(true);
  search = '';

  constructor(private sb: SupabaseService, public auth: AuthService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    let q = this.sb.client.from('staff').select('*').order('full_name');
    if (this.search) q = q.ilike('full_name', `%${this.search}%`);
    const { data } = await q;
    this.staff.set(data ?? []);
    this.loading.set(false);
  }

  async toggleActive(s: any) {
    await this.sb.client.from('staff').update({ is_active: !s.is_active }).eq('id', s.id);
    await this.load();
  }

  async delete(id: string) {
    if (!confirm('Delete this staff member?')) return;
    await this.sb.client.from('staff').delete().eq('id', id);
    await this.load();
  }
}
