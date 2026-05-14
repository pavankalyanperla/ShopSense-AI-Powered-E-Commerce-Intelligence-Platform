import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    BadgeModule,
    InputTextModule,
    AvatarModule
  ],
  template: `
    <header class="ss-header" [class.scrolled]="isScrolled">
      <div class="ss-header-inner">
        <!-- Logo -->
        <a routerLink="/home" class="ss-logo">
          <span class="ss-logo-icon">S</span>
          <span class="ss-logo-text">ShopSense</span>
        </a>

        <!-- Search bar -->
        <div class="ss-search-wrap">
          <span class="ss-search-box">
            <i class="pi pi-search ss-search-icon"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              placeholder="Search products, brands, categories..."
              class="ss-search-input"
            />
            <button
              *ngIf="searchQuery"
              class="ss-search-clear"
              (click)="searchQuery = ''"
            >
              &times;
            </button>
          </span>
        </div>

        <!-- Nav actions -->
        <nav class="ss-nav">
          <!-- Category link -->
          <a routerLink="/customer/products" class="ss-nav-link">
            <i class="pi pi-th-large"></i>
            <span>Catalogue</span>
          </a>

          <!-- Cart (auth only) -->
          <a
            *ngIf="isLoggedIn()"
            routerLink="/customer/cart"
            class="ss-nav-btn ss-nav-cart"
          >
            <i class="pi pi-shopping-cart text-xl"></i>
            <span *ngIf="cartService.cartCount() > 0" class="ss-cart-badge">
              {{ cartService.cartCount() }}
            </span>
          </a>

          <!-- Logged-in menu -->
          <ng-container *ngIf="isLoggedIn(); else guestNav">
            <div
              class="ss-user-menu"
              (click)="toggleUserMenu()"
            >
              <p-avatar
                [label]="getUserInitial()"
                styleClass="ss-avatar"
                shape="circle"
              ></p-avatar>
              <span class="ss-user-name">{{ getFirstName() }}</span>
              <i class="pi pi-chevron-down text-xs"></i>

              <div *ngIf="userMenuOpen" class="ss-dropdown">
                <div class="ss-dropdown-header">
                  <p class="font-bold m-0">
                    {{ currentUser?.fullName }}
                  </p>
                  <p class="text-xs text-500 m-0">
                    {{ currentUser?.email }}
                  </p>
                </div>

                <a
                  *ngFor="let item of getUserMenuItems()"
                  [routerLink]="item.route"
                  class="ss-dropdown-item"
                  (click)="userMenuOpen = false"
                >
                  <i [class]="item.icon"></i>
                  {{ item.label }}
                </a>

                <div class="ss-dropdown-divider"></div>

                <button class="ss-dropdown-item ss-logout" (click)="onLogout()">
                  <i class="pi pi-sign-out"></i>
                  Sign Out
                </button>
              </div>
            </div>
          </ng-container>

          <ng-template #guestNav>
            <a routerLink="/auth/login" class="ss-btn-login">Login</a>
            <a routerLink="/auth/register" class="ss-btn-register">Register</a>
          </ng-template>
        </nav>
      </div>

      <!-- Category strip -->
      <div class="ss-category-strip">
        <a
          *ngFor="let cat of topCategories"
          class="ss-cat-link"
          [routerLink]="['/customer/products']"
          [queryParams]="{ search: cat }"
        >
          {{ cat }}
        </a>
      </div>
    </header>

    <!-- Spacer to avoid content hiding under fixed header -->
    <div style="height: 100px"></div>
  `,
  styles: [
    `
      .ss-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: var(--ss-brand-blue);
        transition: box-shadow 0.2s;
      }

      .ss-header.scrolled {
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
      }

      .ss-header-inner {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        max-width: 1280px;
        margin: 0 auto;
      }

      .ss-logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        flex-shrink: 0;
      }

      .ss-logo-icon {
        width: 32px;
        height: 32px;
        background: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: var(--ss-brand-blue);
        font-size: 1rem;
      }

      .ss-logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
      }

      .ss-search-wrap {
        flex: 1;
        max-width: 580px;
      }

      .ss-search-box {
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 10px;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
      }

      .ss-search-icon {
        color: #94a3b8;
      }

      .ss-search-input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 0.9rem;
        background: transparent;
        color: var(--ss-text-primary);
      }

      .ss-search-clear {
        border: none;
        background: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 1.2rem;
        padding: 0;
      }

      .ss-nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .ss-nav-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        font-size: 0.7rem;
        cursor: pointer;
      }

      .ss-nav-link i {
        font-size: 1.1rem;
      }

      .ss-nav-link:hover {
        color: #fff;
      }

      .ss-nav-btn {
        position: relative;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.9);
      }

      .ss-cart-badge {
        position: absolute;
        top: -6px;
        right: -8px;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }

      .ss-user-menu {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: #fff;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
      }

      .ss-user-menu:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .ss-user-name {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .ss-avatar {
        width: 32px !important;
        height: 32px !important;
        font-size: 0.875rem !important;
        background: rgba(255, 255, 255, 0.25) !important;
      }

      .ss-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 220px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        z-index: 200;
      }

      .ss-dropdown-header {
        padding: 0.75rem 1rem;
        background: var(--ss-surface-50);
        border-bottom: 1px solid var(--ss-surface-200);
      }

      .ss-dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        color: var(--ss-text-primary);
        text-decoration: none;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
      }

      .ss-dropdown-item:hover {
        background: var(--ss-surface-50);
      }

      .ss-logout {
        color: #ef4444;
      }

      .ss-dropdown-divider {
        height: 1px;
        background: var(--ss-surface-200);
        margin: 0.25rem 0;
      }

      .ss-btn-login {
        padding: 0.4rem 0.875rem;
        border: 1.5px solid rgba(255, 255, 255, 0.6);
        border-radius: 8px;
        color: #fff;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .ss-btn-login:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .ss-btn-register {
        padding: 0.4rem 0.875rem;
        background: #fff;
        border-radius: 8px;
        color: var(--ss-brand-blue);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .ss-btn-register:hover {
        background: #eff6ff;
      }

      .ss-category-strip {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 0 1.5rem;
        background: rgba(0, 0, 0, 0.15);
        overflow-x: auto;
      }

      .ss-category-strip::-webkit-scrollbar {
        display: none;
      }

      .ss-cat-link {
        padding: 0.4rem 0.875rem;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        font-size: 0.8rem;
        white-space: nowrap;
      }

      .ss-cat-link:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }
    `
  ]
})
export class HeaderComponent implements OnInit {
  searchQuery = '';
  isScrolled = false;
  userMenuOpen = false;
  currentUser: any = null;

  topCategories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Books',
    'Sports & Fitness',
    'Grocery & Gourmet',
    'Toys & Baby'
  ];

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {}

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.ss-user-menu')) {
      this.userMenuOpen = false;
    }
  }

  ngOnInit() {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load cart if authenticated
    if (this.isLoggedIn()) {
      this.cartService.getCart().subscribe();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/customer/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getUserInitial(): string {
    return this.currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U';
  }

  getFirstName(): string {
    return this.currentUser?.fullName?.split(' ')[0] || 'User';
  }

  getUserMenuItems() {
    const role = this.currentUser?.role;
    const base = [
      {
        label: 'My Orders',
        icon: 'pi pi-box mr-2',
        route: '/customer/orders'
      },
      {
        label: 'Wishlist',
        icon: 'pi pi-heart mr-2',
        route: '/customer/wishlist'
      },
      {
        label: 'My Reviews',
        icon: 'pi pi-star mr-2',
        route: '/customer/reviews'
      }
    ];

    if (role === 'Seller') {
      base.push({
        label: 'Seller Dashboard',
        icon: 'pi pi-shop mr-2',
        route: '/seller/dashboard'
      });
    }

    if (role === 'Admin') {
      base.push({
        label: 'Admin Panel',
        icon: 'pi pi-cog mr-2',
        route: '/admin/dashboard'
      });
    }

    return base;
  }

  onLogout() {
    this.userMenuOpen = false;
    this.authService.logout().subscribe();
  }
}
