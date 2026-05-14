import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const customerRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.CustomerDashboardComponent),
        title: 'Dashboard - ShopSense'
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent),
        title: 'Products - ShopSense'
      },
      {
        path: 'products/:slug',
        loadComponent: () => import('./products/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Product Details - ShopSense'
      },
      {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
        title: 'Shopping Cart - ShopSense'
      },
      {
        path: 'checkout',
        loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Checkout - ShopSense'
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent),
        title: 'My Orders - ShopSense'
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./wishlist/wishlist.component').then(m => m.WishlistComponent),
        title: 'My Wishlist - ShopSense'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./my-reviews/my-reviews.component').then(m => m.MyReviewsComponent),
        title: 'My Reviews - ShopSense'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
