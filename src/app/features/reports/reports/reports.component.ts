import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  period: 'daily' | 'weekly' | 'monthly' = 'monthly';
  loading = signal(true);

  summary = signal({
    totalBatches: 0,
    totalPairs: 0,
    packaged: 0,
    inProgress: 0,
  });

  statusBreakdown = signal<{ status: string; count: number; pairs: number }[]>([]);
  topWorkers = signal<any[]>([]);

  constructor(private sb: SupabaseService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    const from = this.getFromDate();

    const { data: batches } = await this.sb.client
      .from('production_batches')
      .select('id, quantity, status, assigned_to, created_at')
      .gte('created_at', from);

    const all = batches ?? [];
    const totalPairs = all.reduce((s: number, b: any) => s + (b.quantity ?? 0), 0);
    const packaged = all.filter((b: any) => b.status === 'packaged').length;
    const inProgress = all.filter((b: any) => !['packaged', 'cancelled'].includes(b.status)).length;

    this.summary.set({ totalBatches: all.length, totalPairs, packaged, inProgress });

    const statusMap = new Map<string, { count: number; pairs: number }>();
    for (const b of all) {
      const existing = statusMap.get(b.status) ?? { count: 0, pairs: 0 };
      statusMap.set(b.status, { count: existing.count + 1, pairs: existing.pairs + (b.quantity ?? 0) });
    }
    this.statusBreakdown.set(Array.from(statusMap.entries()).map(([status, v]) => ({ status, ...v })));

    const workerMap = new Map<string, number>();
    for (const b of all.filter((b: any) => b.assigned_to)) {
      workerMap.set(b.assigned_to, (workerMap.get(b.assigned_to) ?? 0) + (b.quantity ?? 0));
    }
    if (workerMap.size > 0) {
      const ids = Array.from(workerMap.keys());
      const { data: staffData } = await this.sb.client.from('staff').select('id, full_name').in('id', ids);
      const workers = (staffData ?? []).map((s: any) => ({
        ...s,
        pairs: workerMap.get(s.id) ?? 0,
      })).sort((a: any, b: any) => b.pairs - a.pairs).slice(0, 5);
      this.topWorkers.set(workers);
    }

    this.loading.set(false);
  }

  private getFromDate(): string {
    const d = new Date();
    if (this.period === 'daily') d.setDate(d.getDate() - 1);
    else if (this.period === 'weekly') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    return d.toISOString();
  }

  barWidth(value: number, max: number) {
    if (max === 0) return '0%';
    return Math.round((value / max) * 100) + '%';
  }

  maxPairs() { return Math.max(...this.topWorkers().map(w => w.pairs), 1); }
}
