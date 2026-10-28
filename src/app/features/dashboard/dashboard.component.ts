import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

interface StatCard {
  label: string;
  value: number | string;
  sub: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats = signal<StatCard[]>([]);
  recentBatches = signal<any[]>([]);
  lowStockItems = signal<any[]>([]);
  loading = signal(true);

  constructor(private sb: SupabaseService) {}

  async ngOnInit() {
    await Promise.all([this.loadStats(), this.loadRecentBatches(), this.loadLowStock()]);
    this.loading.set(false);
  }

  private async loadStats() {
    const [batches, inventory, staff] = await Promise.all([
      this.sb.client.from('production_batches').select('id, quantity, status'),
      this.sb.client.from('raw_materials').select('id, quantity, reorder_level'),
      this.sb.client.from('staff').select('id').eq('is_active', true),
    ]);

    const totalPairs = (batches.data ?? []).reduce((s: number, b: any) => s + (b.quantity || 0), 0);
    const inProgress = (batches.data ?? []).filter((b: any) => !['packaged', 'cancelled'].includes(b.status)).length;
    const lowStock = (inventory.data ?? []).filter((m: any) => (m.quantity ?? 0) <= (m.reorder_level ?? 0)).length;

    this.stats.set([
      { label: 'Total Pairs Produced', value: totalPairs.toLocaleString(), sub: 'All time', color: 'bg-amber-500' },
      { label: 'Active Batches', value: inProgress, sub: 'In production', color: 'bg-blue-500' },
      { label: 'Active Staff', value: staff.data?.length ?? 0, sub: 'Workers on floor', color: 'bg-emerald-500' },
      { label: 'Low Stock Alerts', value: lowStock, sub: 'Materials below threshold', color: 'bg-red-500' },
    ]);
  }

  private async loadRecentBatches() {
    const { data } = await this.sb.client
      .from('production_batches')
      .select('id, batch_number, shoe_model, quantity, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    this.recentBatches.set(data ?? []);
  }

  private async loadLowStock() {
    const { data } = await this.sb.client
      .from('raw_materials')
      .select('id, name, quantity, unit, reorder_level')
      .order('quantity', { ascending: true })
      .limit(5);
    this.lowStockItems.set((data ?? []).filter((m: any) => (m.quantity ?? 0) <= (m.reorder_level ?? 0)));
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
}
