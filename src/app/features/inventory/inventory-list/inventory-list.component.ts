import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
  materials = signal<any[]>([]);
  loading = signal(true);
  search = '';

  constructor(private sb: SupabaseService, public auth: AuthService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    let q = this.sb.client.from('raw_materials').select('*').order('name');
    if (this.search) q = q.ilike('name', `%${this.search}%`);
    const { data } = await q;
    this.materials.set(data ?? []);
    this.loading.set(false);
  }

  isLowStock(m: any) { return (m.quantity ?? 0) <= (m.reorder_level ?? 0); }

  async delete(id: string) {
    if (!confirm('Delete this material?')) return;
    await this.sb.client.from('raw_materials').delete().eq('id', id);
    await this.load();
  }
}
