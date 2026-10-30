import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [RouterModule, CommonModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  features = [
    {
      icon: 'production',
      title: 'Production Tracking',
      desc: 'Log every batch from cutting to packaging. Track status across all 5 production stages in real time.',
    },
    {
      icon: 'inventory',
      title: 'Inventory Management',
      desc: 'Monitor raw materials — leather, soles, thread, glue — with automatic low-stock alerts before you run out.',
    },
    {
      icon: 'staff',
      title: 'Staff & Worker Records',
      desc: 'Manage your production floor workers, assign batches, and track output per worker across departments.',
    },
    {
      icon: 'reports',
      title: 'Reports & Analytics',
      desc: 'Daily, weekly, and monthly production summaries. See top workers, stage breakdowns, and pair counts at a glance.',
    },
    {
      icon: 'roles',
      title: 'Role-Based Access',
      desc: 'Admin, Supervisor, and Store Keeper roles — each sees only what they need. Secure and organised.',
    },
    {
      icon: 'realtime',
      title: 'Live Data',
      desc: 'Powered by Supabase. Every record you add is instantly saved and accessible from anywhere.',
    },
  ];

  currentYear = new Date().getFullYear();

  stages = [
    { label: 'Cutting', color: 'bg-yellow-400', desc: 'Upper and sole pieces cut to pattern' },
    { label: 'Stitching', color: 'bg-blue-400', desc: 'Components stitched together' },
    { label: 'Lasting', color: 'bg-purple-400', desc: 'Upper pulled over last and bonded' },
    { label: 'Finishing', color: 'bg-orange-400', desc: 'Polished, trimmed and quality checked' },
    { label: 'Packaged', color: 'bg-green-400', desc: 'Boxed and ready for dispatch' },
  ];
}
