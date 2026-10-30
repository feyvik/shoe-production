import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { LandingComponent } from './features/landing/landing.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductionListComponent } from './features/production/production-list/production-list.component';
import { ProductionFormComponent } from './features/production/production-form/production-form.component';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list.component';
import { InventoryFormComponent } from './features/inventory/inventory-form/inventory-form.component';
import { StaffListComponent } from './features/staff/staff-list/staff-list.component';
import { StaffFormComponent } from './features/staff/staff-form/staff-form.component';
import { ReportsComponent } from './features/reports/reports/reports.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'production', component: ProductionListComponent },
      { path: 'production/new', component: ProductionFormComponent },
      { path: 'production/:id/edit', component: ProductionFormComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'inventory/new', component: InventoryFormComponent },
      { path: 'inventory/:id/edit', component: InventoryFormComponent },
      { path: 'staff', component: StaffListComponent },
      { path: 'staff/new', component: StaffFormComponent },
      { path: 'staff/:id/edit', component: StaffFormComponent },
      { path: 'reports', component: ReportsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
