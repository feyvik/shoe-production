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
    { label: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { label: 'Production', icon: 'factory', route: '/production' },
    { label: 'Inventory', icon: 'warehouse', route: '/inventory' },
    { label: 'Staff', icon: 'users', route: '/staff', roles: ['admin', 'supervisor'] },
    { label: 'Reports', icon: 'chart', route: '/reports' },
  ];

  constructor(public auth: AuthService) {}

  visibleItems() {
    const role = this.auth.currentUser()?.role;
    return this.navItems.filter(item => !item.roles || item.roles.includes(role ?? ''));
  }

  signOut() { this.auth.signOut(); }
}
