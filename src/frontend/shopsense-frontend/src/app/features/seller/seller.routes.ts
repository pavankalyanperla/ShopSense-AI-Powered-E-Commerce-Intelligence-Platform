import { Routes } from '@angular/router';

export const SELLER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () => import('./register/seller-register.component').then(m => m.SellerRegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.SellerDashboardComponent)
  },
  {
    path: 'kyc',
    loadComponent: () => import('./kyc/kyc.component').then(m => m.KycComponent)
  },
  {
    path: 'listing-coach',
    loadComponent: () => import('./listing-coach/listing-coach.component').then(m => m.ListingCoachComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component').then(m => m.SellerProductsComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/seller-orders.component').then(m => m.SellerOrdersComponent)
  },
  {
    path: 'earnings',
    loadComponent: () => import('./earnings/earnings.component').then(m => m.SellerEarningsComponent)
  }
];
