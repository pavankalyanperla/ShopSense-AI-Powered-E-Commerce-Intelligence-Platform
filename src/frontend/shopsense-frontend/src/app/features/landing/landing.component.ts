import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService } from '../../core/services/product.service';
import { ProductDto, CategoryDto } from '../../core/models/product.models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule],
  template: `
    <!-- Hero Section -->
    <section class="ss-hero">
      <div class="ss-hero-inner">
        <!-- Left Side -->
        <div class="ss-hero-left">
          <span class="ss-hero-badge">
            🇮🇳 India's AI-Powered Shopping Platform
          </span>
          <h1 class="ss-hero-title">
            Shop Smarter with
            <span class="ss-gradient-text">AI Intelligence</span>
          </h1>
          <p class="ss-hero-subtitle">
            Experience the future of e-commerce with ML-powered fraud detection,
            personalized recommendations, and dynamic pricing — all in one platform.
          </p>
          <div class="ss-hero-actions">
            <button 
              class="ss-btn-primary"
              (click)="router.navigate(['/customer/products'])"
            >
              Start Shopping
              <i class="pi pi-arrow-right ml-2"></i>
            </button>
            <button 
              class="ss-btn-secondary"
              (click)="router.navigate(['/seller/dashboard'])"
            >
              Sell on ShopSense
              <i class="pi pi-shop ml-2"></i>
            </button>
          </div>
          <div class="ss-hero-stats">
            <div class="ss-stat">
              <span class="ss-stat-value">1.5M+</span>
              <span class="ss-stat-label">Products</span>
            </div>
            <div class="ss-stat-divider"></div>
            <div class="ss-stat">
              <span class="ss-stat-value">6</span>
              <span class="ss-stat-label">ML Models</span>
            </div>
            <div class="ss-stat-divider"></div>
            <div class="ss-stat">
              <span class="ss-stat-value">₹0</span>
              <span class="ss-stat-label">Free Delivery</span>
            </div>
          </div>
        </div>

        <!-- Right Side - Floating Cards -->
        <div class="ss-hero-right">
          <div class="ss-float-card ss-float-1">
            <i class="pi pi-shield text-3xl text-green-500 mb-2"></i>
            <h4 class="font-bold mb-1">Fraud Protected</h4>
            <p class="text-sm text-600">XGBoost ML Model</p>
          </div>
          <div class="ss-float-card ss-float-2">
            <i class="pi pi-tag text-3xl text-blue-500 mb-2"></i>
            <h4 class="font-bold mb-1">Smart Prices</h4>
            <p class="text-sm text-600">Dynamic Pricing AI</p>
          </div>
          <div class="ss-float-card ss-float-3">
            <i class="pi pi-chart-line text-3xl text-purple-500 mb-2"></i>
            <h4 class="font-bold mb-1">AI Forecast</h4>
            <p class="text-sm text-600">Prophet Algorithm</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Grid -->
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

    <!-- ML Features Strip -->
    <section class="ss-ml-strip">
      <div class="ss-page">
        <div class="ss-ml-grid">
          <div class="ss-ml-card">
            <i class="pi pi-shield text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Fraud Detection</h4>
            <p class="text-sm opacity-90">XGBoost model protects every transaction</p>
          </div>
          <div class="ss-ml-card">
            <i class="pi pi-heart text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Recommendations</h4>
            <p class="text-sm opacity-90">SVD algorithm personalizes your feed</p>
          </div>
          <div class="ss-ml-card">
            <i class="pi pi-comment text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Sentiment Analysis</h4>
            <p class="text-sm opacity-90">NLP extracts insights from reviews</p>
          </div>
          <div class="ss-ml-card">
            <i class="pi pi-chart-line text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Sales Forecasting</h4>
            <p class="text-sm opacity-90">Prophet predicts demand trends</p>
          </div>
          <div class="ss-ml-card">
            <i class="pi pi-users text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Churn Prediction</h4>
            <p class="text-sm opacity-90">XGBoost identifies at-risk customers</p>
          </div>
          <div class="ss-ml-card">
            <i class="pi pi-tag text-4xl mb-2"></i>
            <h4 class="font-bold mb-1">Dynamic Pricing</h4>
            <p class="text-sm opacity-90">Regression optimizes product prices</p>
          </div>
        </div>
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

    <!-- Seller CTA -->
    <section class="ss-page">
      <div class="ss-seller-cta">
        <div class="ss-seller-cta-content">
          <h2 class="text-3xl font-bold mb-2">Start Selling on ShopSense</h2>
          <p class="text-lg opacity-90">
            Join thousands of sellers and grow your business with AI-powered insights
          </p>
        </div>
        <button 
          class="ss-seller-cta-btn"
          (click)="router.navigate(['/seller/dashboard'])"
        >
          Become a Seller
          <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </section>
  `,
  styles: [`
    /* Hero Section */
    .ss-hero {
      background: linear-gradient(135deg, #1F4E79 0%, #2563EB 100%);
      padding: 3rem 1.5rem;
      margin-top: -100px;
      padding-top: 120px;
    }

    .ss-hero-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    @media (max-width: 768px) {
      .ss-hero-inner {
        grid-template-columns: 1fr;
      }
      .ss-hero-right {
        display: none;
      }
    }

    .ss-hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }

    .ss-hero-title {
      font-size: 3rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .ss-gradient-text {
      background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .ss-hero-subtitle {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .ss-hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
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
      transition: all 0.2s;
    }

    .ss-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #fff;
    }

    .ss-hero-stats {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .ss-stat {
      display: flex;
      flex-direction: column;
    }

    .ss-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
    }

    .ss-stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .ss-stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
    }

    /* Floating Cards */
    .ss-hero-right {
      position: relative;
      height: 400px;
    }

    .ss-float-card {
      position: absolute;
      background: #fff;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      text-align: center;
      min-width: 180px;
    }

    .ss-float-1 {
      top: 20px;
      right: 100px;
      animation: float 3s ease-in-out infinite;
    }

    .ss-float-2 {
      top: 140px;
      right: 20px;
      animation: float 3s ease-in-out infinite 1s;
    }

    .ss-float-3 {
      top: 260px;
      right: 120px;
      animation: float 3s ease-in-out infinite 2s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
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

    .ss-view-all:hover {
      text-decoration: underline;
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

    /* ML Features Strip */
    .ss-ml-strip {
      background: var(--ss-brand-blue);
      color: #fff;
      padding: 3rem 0;
    }

    .ss-ml-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 2rem;
    }

    .ss-ml-card {
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

    /* Seller CTA */
    .ss-seller-cta {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #fff;
      padding: 3rem;
      border-radius: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .ss-seller-cta-btn {
      background: #fff;
      color: #10B981;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .ss-seller-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class LandingComponent implements OnInit {
  categories: CategoryDto[] = [];
  featuredProducts: ProductDto[] = [];
  loadingCategories = true;
  loadingProducts = true;

  constructor(
    public router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
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
