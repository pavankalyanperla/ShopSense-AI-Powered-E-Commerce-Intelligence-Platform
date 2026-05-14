import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductDto } from '../../../core/models/product.models';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule],
  template: `
    <div class="ss-page">
      <h1 class="ss-page-title">My Wishlist</h1>
      <p class="ss-page-subtitle">Your saved products</p>

      <!-- Loading State -->
      @if (loading) {
        <div class="ss-product-grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="ss-product-card">
              <p-skeleton width="100%" height="200px" styleClass="mb-2" />
              <p-skeleton width="60%" height="1rem" styleClass="mb-2" />
              <p-skeleton width="80%" height="1rem" styleClass="mb-2" />
              <p-skeleton width="40%" height="1.5rem" />
            </div>
          }
        </div>
      }

      <!-- Products Grid -->
      @if (!loading && products.length > 0) {
        <div class="ss-product-grid">
          @for (product of products; track product.id) {
            <div class="ss-product-card">
              <a [routerLink]="['/customer/products', product.slug]" class="ss-product-link">
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
              <div class="ss-product-actions">
                <button 
                  class="ss-btn-add-cart"
                  (click)="addToCart(product)"
                  [disabled]="product.stockQuantity === 0"
                >
                  <i class="pi pi-shopping-cart"></i>
                  <span>{{ product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart' }}</span>
                </button>
                <button 
                  class="ss-btn-remove"
                  (click)="removeFromWishlist(product.id)"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading && products.length === 0) {
        <div class="ss-empty-state">
          <i class="pi pi-heart text-6xl text-500 mb-3"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love to buy them later</p>
          <button class="ss-btn-browse" (click)="router.navigate(['/customer/products'])">
            <i class="pi pi-shopping-bag"></i>
            <span>Browse Products</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .ss-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      min-height: calc(100vh - 300px);
    }

    .ss-page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-page-subtitle {
      font-size: 1.125rem;
      color: var(--ss-text-secondary);
      margin-bottom: 2rem;
    }

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
      transition: all 0.2s;
    }

    .ss-product-card:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .ss-product-link {
      text-decoration: none;
      display: block;
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

    .ss-product-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .ss-btn-add-cart {
      flex: 1;
      background: var(--ss-brand-blue);
      color: #fff;
      padding: 0.625rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .ss-btn-add-cart:hover:not(:disabled) {
      background: #1a3f5f;
    }

    .ss-btn-add-cart:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ss-btn-remove {
      background: #fff;
      color: #ef4444;
      padding: 0.625rem 1rem;
      border: 1.5px solid #ef4444;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ss-btn-remove:hover {
      background: #ef4444;
      color: #fff;
    }

    .ss-empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .ss-empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-empty-state p {
      font-size: 1rem;
      color: var(--ss-text-secondary);
      margin-bottom: 2rem;
    }

    .ss-btn-browse {
      background: var(--ss-brand-blue);
      color: #fff;
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .ss-btn-browse:hover {
      background: #1a3f5f;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class WishlistComponent implements OnInit {
  products: ProductDto[] = [];
  loading = true;

  constructor(
    public router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.productService.getWishlist().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  addToCart(product: ProductDto): void {
    this.cartService.addToCart({
      productId: product.id,
      quantity: 1
    }).subscribe({
      next: () => {
        this.router.navigate(['/customer/cart']);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this.productService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== productId);
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  }
}
