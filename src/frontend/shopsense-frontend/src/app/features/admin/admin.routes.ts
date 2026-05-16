import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./kyc/admin-kyc.component').then(m => m.AdminKycComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./coupons/admin-coupons.component').then(m => m.AdminCouponsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent)
      }
    ]
  }
];
