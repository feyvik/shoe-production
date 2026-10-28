import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-staff-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-form.component.html',
})
export class StaffFormComponent implements OnInit {
  isEdit = false;
  staffId = '';
  loading = signal(false);
  error = '';

  form = {
    full_name: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    is_active: true,
    notes: '',
  };

  roles = ['Cutter', 'Stitcher', 'Laster', 'Finisher', 'Quality Control', 'Store Keeper', 'Supervisor'];
  departments = ['Cutting', 'Stitching', 'Lasting', 'Finishing', 'Quality', 'Store'];

  constructor(private sb: SupabaseService, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.staffId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.staffId;
    if (this.isEdit) {
      const { data } = await this.sb.client.from('staff').select('*').eq('id', this.staffId).single();
      if (data) Object.assign(this.form, data);
    }
  }

  async save() {
    this.error = '';
    this.loading.set(true);
    try {
      if (this.isEdit) {
        const { error } = await this.sb.client.from('staff').update(this.form).eq('id', this.staffId);
        if (error) throw error;
      } else {
        const { error } = await this.sb.client.from('staff').insert(this.form);
        if (error) throw error;
      }
      this.router.navigate(['/staff']);
    } catch (e: any) {
      this.error = e.message ?? 'Failed to save';
    } finally {
      this.loading.set(false);
    }
  }
}
