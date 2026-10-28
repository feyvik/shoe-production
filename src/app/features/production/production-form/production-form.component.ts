import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-production-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './production-form.component.html',
})
export class ProductionFormComponent implements OnInit {
  isEdit = false;
  batchId = '';
  loading = signal(false);
  error = '';
  staff = signal<any[]>([]);

  form = {
    batch_number: '',
    shoe_model: '',
    shoe_type: '',
    quantity: 0,
    size_range: '',
    color: '',
    assigned_to: '',
    status: 'cutting',
    notes: '',
  };

  statuses = ['cutting', 'stitching', 'lasting', 'finishing', 'packaged', 'cancelled'];

  constructor(private sb: SupabaseService, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.batchId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.batchId;

    const { data: staffData } = await this.sb.client.from('staff').select('id, full_name').eq('is_active', true);
    this.staff.set(staffData ?? []);

    if (this.isEdit) {
      const { data } = await this.sb.client.from('production_batches').select('*').eq('id', this.batchId).single();
      if (data) Object.assign(this.form, data);
    } else {
      this.form.batch_number = 'BATCH-' + Date.now().toString().slice(-6);
    }
  }

  async save() {
    this.error = '';
    this.loading.set(true);
    try {
      if (this.isEdit) {
        const { error } = await this.sb.client.from('production_batches').update(this.form).eq('id', this.batchId);
        if (error) throw error;
      } else {
        const { error } = await this.sb.client.from('production_batches').insert(this.form);
        if (error) throw error;
      }
      this.router.navigate(['/production']);
    } catch (e: any) {
      this.error = e.message ?? 'Failed to save';
    } finally {
      this.loading.set(false);
    }
  }
}
