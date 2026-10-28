import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-inventory-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory-form.component.html',
})
export class InventoryFormComponent implements OnInit {
  isEdit = false;
  itemId = '';
  loading = signal(false);
  error = '';

  form = {
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    reorder_level: 0,
    supplier: '',
    notes: '',
  };

  categories = ['Leather', 'Soles', 'Thread', 'Glue', 'Lining', 'Hardware', 'Packaging', 'Other'];

  constructor(private sb: SupabaseService, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.itemId;
    if (this.isEdit) {
      const { data } = await this.sb.client.from('raw_materials').select('*').eq('id', this.itemId).single();
      if (data) Object.assign(this.form, data);
    }
  }

  async save() {
    this.error = '';
    this.loading.set(true);
    try {
      if (this.isEdit) {
        const { error } = await this.sb.client.from('raw_materials').update(this.form).eq('id', this.itemId);
        if (error) throw error;
      } else {
        const { error } = await this.sb.client.from('raw_materials').insert(this.form);
        if (error) throw error;
      }
      this.router.navigate(['/inventory']);
    } catch (e: any) {
      this.error = e.message ?? 'Failed to save';
    } finally {
      this.loading.set(false);
    }
  }
}
