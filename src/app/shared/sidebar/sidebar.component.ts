import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid', route: '/app/dashboard' },
    { label: 'Production', icon: 'factory', route: '/app/production' },
    { label: 'Inventory', icon: 'warehouse', route: '/app/inventory' },
    { label: 'Staff', icon: 'users', route: '/app/staff', roles: ['admin', 'supervisor'] },
    { label: 'Reports', icon: 'chart', route: '/app/reports' },
  ];

  constructor(public auth: AuthService) {}

  visibleItems() {
    const role = this.auth.currentUser()?.role;
    return this.navItems.filter(item => !item.roles || item.roles.includes(role ?? ''));
  }

  signOut() { this.auth.signOut(); }
}
