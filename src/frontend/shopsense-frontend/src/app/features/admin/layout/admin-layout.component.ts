import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonModule],
  template: `
    <div class="ss-admin-shell">
      <!-- Sidebar -->
      <aside class="ss-admin-sidebar">
        <div class="ss-admin-logo">
          <span class="ss-admin-logo-icon">S</span>
          <div>
            <p class="font-bold text-white m-0 text-sm">ShopSense</p>
            <p class="text-xs m-0" style="color:rgba(255,255,255,.5)">Admin Portal</p>
          </div>
        </div>
        
        <nav class="ss-admin-nav">
          <p class="ss-admin-nav-section">OVERVIEW</p>
          <a *ngFor="let item of navItems" [routerLink]="item.route" routerLinkActive="active" class="ss-admin-nav-item">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
            <span *ngIf="item.badge" class="ss-admin-badge">{{ item.badge }}</span>
          </a>
        </nav>
        
        <div class="ss-admin-sidebar-footer">
          <button class="ss-admin-logout" (click)="authService.logout()">
            <i class="pi pi-sign-out mr-2"></i>Sign Out
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="ss-admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .ss-admin-shell {
      display: flex;
      min-height: 100vh;
    }
    .ss-admin-sidebar {
      width: 240px;
      background: #0F172A;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .ss-admin-logo {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .ss-admin-logo-icon {
      width: 36px;
      height: 36px;
      background: var(--ss-brand-blue);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .ss-admin-nav {
      flex: 1;
      padding: 1rem 0;
    }
    .ss-admin-nav-section {
      font-size: .65rem;
      font-weight: 700;
      color: rgba(255,255,255,.3);
      letter-spacing: .1em;
      padding: .5rem 1rem .25rem;
      margin: 0;
    }
    .ss-admin-nav-item {
      display: flex;
      align-items: center;
      gap: .625rem;
      padding: .625rem 1rem;
      color: rgba(255,255,255,.65);
      text-decoration: none;
      font-size: .875rem;
      transition: all .15s;
      cursor: pointer;
      border-left: 3px solid transparent;
    }
    .ss-admin-nav-item:hover {
      color: #fff;
      background: rgba(255,255,255,.06);
    }
    .ss-admin-nav-item.active {
      color: #fff;
      background: rgba(46,117,182,.3);
      border-left-color: var(--ss-brand-light);
    }
    .ss-admin-badge {
      margin-left: auto;
      background: #EF4444;
      color: #fff;
      font-size: .65rem;
      font-weight: 700;
      padding: .1rem .4rem;
      border-radius: 10px;
    }
    .ss-admin-sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .ss-admin-logout {
      width: 100%;
      padding: .625rem;
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.65);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: .875rem;
      text-align: left;
    }
    .ss-admin-logout:hover {
      background: rgba(239,68,68,.2);
      color: #FCA5A5;
    }
    .ss-admin-main {
      flex: 1;
      background: var(--ss-surface-50);
      overflow-y: auto;
      padding: 1.5rem;
    }
  `]
})
export class AdminLayoutComponent {
  navItems = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/admin/dashboard' },
    { label: 'Orders', icon: 'pi pi-shopping-bag', route: '/admin/orders' },
    { label: 'Products', icon: 'pi pi-box', route: '/admin/products' },
    { label: 'Sellers', icon: 'pi pi-shop', route: '/admin/sellers', badge: '' },
    { label: 'Customers', icon: 'pi pi-users', route: '/admin/customers' },
    { label: 'KYC Review', icon: 'pi pi-id-card', route: '/admin/kyc', badge: '' },
    { label: 'Fraud Alerts', icon: 'pi pi-shield', route: '/admin/fraud', badge: '' },
    { label: 'Coupons', icon: 'pi pi-tag', route: '/admin/coupons' },
    { label: 'Notifications', icon: 'pi pi-bell', route: '/admin/notifications' },
    { label: 'Reviews', icon: 'pi pi-star', route: '/admin/reviews' },
    { label: 'Reports', icon: 'pi pi-chart-bar', route: '/admin/reports' }
  ];

  constructor(public authService: AuthService) {}
}
