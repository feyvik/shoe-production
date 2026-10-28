import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth.service';

const STAGES = ['cutting', 'stitching', 'lasting', 'finishing', 'packaged', 'cancelled'];

@Component({
  selector: 'app-production-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './production-list.component.html',
})
export class ProductionListComponent implements OnInit {
  batches = signal<any[]>([]);
  loading = signal(true);
  search = '';
  statusFilter = '';
  statuses = STAGES;

  constructor(private sb: SupabaseService, public auth: AuthService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    let q = this.sb.client
      .from('production_batches')
      .select('id, batch_number, shoe_model, quantity, status, created_at, assigned_to:staff(full_name)')
      .order('created_at', { ascending: false });
    if (this.statusFilter) q = q.eq('status', this.statusFilter);
    if (this.search) q = q.ilike('batch_number', `%${this.search}%`);
    const { data } = await q;
    this.batches.set(data ?? []);
    this.loading.set(false);
  }

  async advanceStatus(batch: any) {
    const idx = STAGES.indexOf(batch.status);
    if (idx < 0 || idx >= STAGES.length - 2) return;
    const next = STAGES[idx + 1];
    await this.sb.client.from('production_batches').update({ status: next }).eq('id', batch.id);
    await this.load();
  }

  async deleteBatch(id: string) {
    if (!confirm('Delete this batch?')) return;
    await this.sb.client.from('production_batches').delete().eq('id', id);
    await this.load();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      cutting: 'bg-yellow-100 text-yellow-800',
      stitching: 'bg-blue-100 text-blue-800',
      lasting: 'bg-purple-100 text-purple-800',
      finishing: 'bg-orange-100 text-orange-800',
      packaged: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-800';
  }

  canAdvance(status: string) {
    const idx = STAGES.indexOf(status);
    return idx >= 0 && idx < STAGES.length - 2;
  }
}
