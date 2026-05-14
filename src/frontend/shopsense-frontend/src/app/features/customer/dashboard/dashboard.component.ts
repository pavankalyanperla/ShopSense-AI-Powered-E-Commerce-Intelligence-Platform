import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductDto, CategoryDto } from '../../../core/models/product.models';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule],
  template: `
    <!-- Hero Banner -->
    <section class="ss-dashboard-hero">
      <div class="ss-hero-content">
        <div class="ss-hero-left">
          <h1 class="ss-greeting">{{ getGreeting() }}, {{ getFirstName() }}!</h1>
          <p class="ss-hero-subtitle">Welcome back to your personalized shopping experience</p>
          <div class="ss-hero-stats">
            <div class="ss-stat-item">
              <i class="pi pi-shopping-cart"></i>
              <span>{{ cartCount() }} items in cart</span>
            </div>
          </div>
          <div class="ss-hero-actions">
            <button class="ss-btn-primary" (click)="router.navigate(['/customer/products'])">
              <i class="pi pi-shopping-bag"></i>
              <span>Browse Products</span>
            </button>
            <button class="ss-btn-secondary" (click)="router.navigate(['/customer/cart'])">
              <i class="pi pi-shopping-cart"></i>
              <span>View Cart</span>
            </button>
          </div>
        </div>
        <div class="ss-hero-right">
          <div class="ss-kpi-card ss-kpi-1">
            <i class="pi pi-shield text-green-500"></i>
            <h4>Fraud Protected</h4>
            <p>XGBoost ML</p>
          </div>
          <div class="ss-kpi-card ss-kpi-2">
            <i class="pi pi-tag text-blue-500"></i>
            <h4>Dynamic Prices</h4>
            <p>Best Deals</p>
          </div>
          <div class="ss-kpi-card ss-kpi-3">
            <i class="pi pi-heart text-purple-500"></i>
            <h4>AI Recs</h4>
            <p>Just for You</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="ss-page">
      <h2 class="ss-section-title">Shop by Category</h2>
      <div class="ss-category-grid">
        @if (loadingCategories) {
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="ss-category-card">
              <p-skeleton shape="circle" size="60px" styleClass="mb-2" />
              <p-skeleton width="80px" height="1rem" />
            </div>
          }
        } @else {
          @for (cat of categories; track cat.id) {
            <a 
              class="ss-category-card"
              [routerLink]="['/customer/products']"
              [queryParams]="{ categoryId: cat.id }"
            >
              <img 
                [src]="cat.imageUrl || 'https://via.placeholder.com/60'" 
                [alt]="cat.name"
                class="ss-category-img"
              />
              <span class="ss-category-name">{{ cat.name }}</span>
            </a>
          }
        }
      </div>
    </section>

    <!-- Featured Products -->
    <section class="ss-page">
      <div class="ss-section-header">
        <h2 class="ss-section-title">⭐ Featured Products</h2>
        <a routerLink="/customer/products" class="ss-view-all">
          View All <i class="pi pi-arrow-right ml-1"></i>
        </a>
      </div>
      <div class="ss-product-grid">
        @if (loadingProducts) {
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="ss-product-card">
              <p-skeleton width="100%" height="200px" styleClass="mb-2" />
              <p-skeleton width="60%" height="1rem" styleClass="mb-2" />
              <p-skeleton width="80%" height="1rem" styleClass="mb-2" />
              <p-skeleton width="40%" height="1.5rem" />
            </div>
          }
        } @else {
          @for (product of featuredProducts; track product.id) {
            <a 
              class="ss-product-card"
              [routerLink]="['/customer/products', product.slug]"
            >
              <div class="ss-product-img-wrap">
                <img 
                  [src]="product.primaryImageUrl" 
                  [alt]="product.name"
                  class="ss-product-img"
                />
                @if (product.discountPercent > 0) {
                  <span class="ss-discount-badge">
                    {{ product.discountPercent }}% OFF
                  </span>
                }
              </div>
              <div class="ss-product-info">
                <p class="ss-product-brand">{{ product.brand }}</p>
                <h4 class="ss-product-name">{{ product.name }}</h4>
                <div class="ss-product-rating">
                  <i class="pi pi-star-fill text-yellow-500"></i>
                  <span>{{ product.averageRating.toFixed(1) }}</span>
                  <span class="text-500">({{ product.reviewCount }})</span>
                </div>
                <div class="ss-product-price">
                  @if (product.discountedPrice) {
                    <span class="ss-price-current">₹{{ product.discountedPrice.toLocaleString() }}</span>
                    <span class="ss-price-original">₹{{ product.basePrice.toLocaleString() }}</span>
                  } @else {
                    <span class="ss-price-current">₹{{ product.basePrice.toLocaleString() }}</span>
                  }
                </div>
              </div>
            </a>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    /* Hero Section */
    .ss-dashboard-hero {
      background: linear-gradient(135deg, #1F4E79 0%, #2563EB 100%);
      padding: 3rem 1.5rem;
      margin-top: -100px;
      padding-top: 120px;
    }

    .ss-hero-content {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    @media (max-width: 768px) {
      .ss-hero-content {
        grid-template-columns: 1fr;
      }
      .ss-hero-right {
        display: none;
      }
    }

    .ss-greeting {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .ss-hero-subtitle {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 1.5rem;
    }

    .ss-hero-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .ss-stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fff;
      font-size: 1rem;
    }

    .ss-stat-item i {
      font-size: 1.25rem;
    }

    .ss-hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .ss-btn-primary {
      background: #fff;
      color: #1F4E79;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .ss-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .ss-btn-secondary {
      background: transparent;
      color: #fff;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .ss-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #fff;
    }

    /* KPI Cards */
    .ss-hero-right {
      position: relative;
      height: 300px;
    }

    .ss-kpi-card {
      position: absolute;
      background: #fff;
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
      min-width: 140px;
    }

    .ss-kpi-card i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .ss-kpi-card h4 {
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: var(--ss-text-primary);
    }

    .ss-kpi-card p {
      font-size: 0.75rem;
      color: var(--ss-text-secondary);
      margin: 0;
    }

    .ss-kpi-1 {
      top: 20px;
      right: 80px;
    }

    .ss-kpi-2 {
      top: 120px;
      right: 20px;
    }

    .ss-kpi-3 {
      top: 220px;
      right: 100px;
    }

    /* Page Container */
    .ss-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .ss-section-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--ss-text-primary);
      margin-bottom: 2rem;
    }

    .ss-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .ss-view-all {
      color: var(--ss-brand-blue);
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    /* Category Grid */
    .ss-category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1.5rem;
    }

    .ss-category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-decoration: none;
      transition: all 0.2s;
    }

    .ss-category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .ss-category-img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin-bottom: 0.75rem;
    }

    .ss-category-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ss-text-primary);
      text-align: center;
    }

    /* Product Grid */
    .ss-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .ss-product-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-decoration: none;
      transition: all 0.2s;
    }

    .ss-product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .ss-product-img-wrap {
      position: relative;
      height: 200px;
      background: var(--ss-surface-50);
    }

    .ss-product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ss-discount-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #ef4444;
      color: #fff;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .ss-product-info {
      padding: 1rem;
    }

    .ss-product-brand {
      font-size: 0.75rem;
      color: var(--ss-text-secondary);
      margin-bottom: 0.25rem;
    }

    .ss-product-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ss-product-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .ss-product-price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ss-price-current {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--ss-text-primary);
    }

    .ss-price-original {
      font-size: 0.875rem;
      color: var(--ss-text-secondary);
      text-decoration: line-through;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  featuredProducts: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loadingProducts = true;
  loadingCategories = true;

  constructor(
    public router: Router,
    private productService: ProductService,
    public cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getFirstName(): string {
    const user = this.authService.currentUserSignal();
    return user?.fullName?.split(' ')[0] || 'User';
  }

  cartCount() {
    return this.cartService.cartCount();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.slice(0, 8);
        this.loadingCategories = false;
      },
      error: () => {
        this.loadingCategories = false;
      }
    });
  }

  loadFeaturedProducts(): void {
    this.productService.getFeaturedProducts(8).subscribe({
      next: (data) => {
        this.featuredProducts = data;
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }
}
