import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductDto } from '../../../core/models/product.models';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RatingModule,
    TagModule,
    GalleriaModule,
    TabViewModule,
    InputNumberModule,
    SkeletonModule
  ],
  template: `
    <div class="product-detail-container">
      <!-- Loading Skeleton -->
      <div *ngIf="loading" class="detail-skeleton">
        <div class="skeleton-grid">
          <div class="skeleton-images">
            <p-skeleton width="100%" height="400px"></p-skeleton>
          </div>
          <div class="skeleton-info">
            <p-skeleton width="80%" height="2rem" styleClass="mb-3"></p-skeleton>
            <p-skeleton width="60%" height="1.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="40%" height="2rem" styleClass="mb-3"></p-skeleton>
            <p-skeleton width="100%" height="4rem" styleClass="mb-3"></p-skeleton>
            <p-skeleton width="100%" height="3rem"></p-skeleton>
          </div>
        </div>
      </div>

      <!-- Product Detail -->
      <div *ngIf="!loading && product" class="product-detail">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a (click)="goBack()">← Back to Products</a>
        </div>

        <div class="detail-grid">
          <!-- Product Images -->
          <div class="product-images">
            <p-galleria 
              [value]="product.images" 
              [responsiveOptions]="responsiveOptions"
              [containerStyle]="{ 'max-width': '100%' }"
              [numVisible]="5"
              [circular]="true"
              [showItemNavigators]="true"
              [showThumbnails]="true">
              <ng-template pTemplate="item" let-image>
                <img [src]="image.imageUrl" [alt]="product.name" style="width: 100%; display: block;" />
              </ng-template>
              <ng-template pTemplate="thumbnail" let-image>
                <img [src]="image.imageUrl" [alt]="product.name" style="width: 100%; display: block;" />
              </ng-template>
            </p-galleria>
          </div>

          <!-- Product Info -->
          <div class="product-info-section">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-brand">Brand: <strong>{{ product.brand }}</strong></p>

            <!-- Rating -->
            <div class="rating-section">
              <p-rating 
                [ngModel]="product.averageRating" 
                [readonly]="true">
              </p-rating>
              <span class="review-count">{{ product.reviewCount }} reviews</span>
            </div>

            <!-- Price -->
            <div class="price-section">
              <div class="price-row">
                <span class="current-price">₹{{ product.discountedPrice || product.basePrice | number:'1.0-0' }}</span>
                <span *ngIf="product.discountedPrice" class="original-price">₹{{ product.basePrice | number:'1.0-0' }}</span>
                <p-tag *ngIf="product.discountPercent > 0" severity="success" [value]="product.discountPercent + '% OFF'"></p-tag>
              </div>
              <p class="tax-info">Inclusive of all taxes</p>
            </div>

            <!-- Stock Status -->
            <div class="stock-section">
              <p-tag 
                *ngIf="product.stockQuantity === 0" 
                severity="danger" 
                value="Out of Stock"
                icon="pi pi-times-circle">
              </p-tag>
              <p-tag 
                *ngIf="product.stockQuantity > 0 && product.stockQuantity < 10" 
                severity="warning" 
                [value]="'Only ' + product.stockQuantity + ' left'"
                icon="pi pi-exclamation-triangle">
              </p-tag>
              <p-tag 
                *ngIf="product.stockQuantity >= 10" 
                severity="success" 
                value="In Stock"
                icon="pi pi-check-circle">
              </p-tag>
            </div>

            <!-- Variants -->
            <div *ngIf="product.variants && product.variants.length > 0" class="variants-section">
              <h3>Available Options:</h3>
              <div class="variants-list">
                <button 
                  *ngFor="let variant of product.variants"
                  pButton 
                  [label]="variant.variantValue"
                  [outlined]="selectedVariant?.id !== variant.id"
                  (click)="selectVariant(variant)"
                  [disabled]="variant.stock === 0"
                  class="variant-btn">
                </button>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="quantity-section">
              <label>Quantity:</label>
              <p-inputNumber 
                [(ngModel)]="quantity" 
                [showButtons]="true" 
                [min]="1" 
                [max]="product.stockQuantity"
                [disabled]="product.stockQuantity === 0">
              </p-inputNumber>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button 
                pButton 
                label="Add to Cart" 
                icon="pi pi-shopping-cart"
                [disabled]="product.stockQuantity === 0"
                (click)="addToCart()"
                class="add-to-cart-btn">
              </button>
              <button 
                pButton 
                [icon]="isInWishlist() ? 'pi pi-heart-fill' : 'pi pi-heart'"
                [label]="isInWishlist() ? 'In Wishlist' : 'Add to Wishlist'"
                [outlined]="true"
                (click)="toggleWishlist()"
                class="wishlist-btn">
              </button>
            </div>

            <!-- Seller Info -->
            <div class="seller-info">
              <p><strong>Sold by:</strong> {{ product.sellerName }}</p>
            </div>
          </div>
        </div>

        <!-- Product Details Tabs -->
        <div class="product-tabs">
          <p-tabView>
            <p-tabPanel header="Description">
              <p>{{ product.description }}</p>
            </p-tabPanel>
            
            <p-tabPanel header="Specifications" *ngIf="product.specifications && product.specifications.length > 0">
              <table class="specs-table">
                <tr *ngFor="let spec of product.specifications">
                  <td class="spec-key">{{ spec.key }}</td>
                  <td class="spec-value">{{ spec.value }}</td>
                </tr>
              </table>
            </p-tabPanel>
            
            <p-tabPanel header="Reviews">
              <div class="reviews-section">
                <p>Reviews will be displayed here (Day 4 feature)</p>
              </div>
            </p-tabPanel>
          </p-tabView>
        </div>
      </div>

      <!-- Product Not Found -->
      <div *ngIf="!loading && !product" class="not-found">
        <i class="pi pi-exclamation-triangle" style="font-size: 4rem; color: var(--text-color-secondary);"></i>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button pButton label="Browse Products" (click)="goBack()"></button>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .breadcrumb {
      margin-bottom: 1.5rem;
    }

    .breadcrumb a {
      color: var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .product-images {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    .product-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .product-brand {
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
    }

    .rating-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .review-count {
      color: var(--text-color-secondary);
    }

    .price-section {
      background: var(--surface-50);
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .current-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .original-price {
      font-size: 1.5rem;
      text-decoration: line-through;
      color: var(--text-color-secondary);
    }

    .tax-info {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }

    .stock-section {
      margin-bottom: 1.5rem;
    }

    .variants-section {
      margin-bottom: 1.5rem;
    }

    .variants-section h3 {
      margin-bottom: 0.75rem;
      font-size: 1.1rem;
    }

    .variants-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .variant-btn {
      min-width: 80px;
    }

    .quantity-section {
      margin-bottom: 1.5rem;
    }

    .quantity-section label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .add-to-cart-btn {
      flex: 2;
      height: 3rem;
      font-size: 1.1rem;
    }

    .wishlist-btn {
      flex: 1;
      height: 3rem;
    }

    .seller-info {
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 8px;
    }

    .product-tabs {
      margin-top: 3rem;
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
    }

    .specs-table tr {
      border-bottom: 1px solid var(--surface-border);
    }

    .specs-table td {
      padding: 1rem;
    }

    .spec-key {
      font-weight: 600;
      width: 30%;
      color: var(--text-color-secondary);
    }

    .spec-value {
      color: var(--text-color);
    }

    .reviews-section {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-secondary);
    }

    .not-found {
      text-align: center;
      padding: 4rem 2rem;
    }

    .not-found h2 {
      margin-top: 1rem;
      font-size: 2rem;
    }

    .not-found p {
      color: var(--text-color-secondary);
      margin-bottom: 2rem;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    @media (max-width: 968px) {
      .detail-grid, .skeleton-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .product-images {
        position: relative;
        top: 0;
      }

      .action-buttons {
        flex-direction: column;
      }

      .add-to-cart-btn, .wishlist-btn {
        flex: 1;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: ProductDto | null = null;
  loading = true;
  quantity = 1;
  selectedVariant: any = null;

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  selectVariant(variant: any): void {
    this.selectedVariant = variant;
  }

  addToCart(): void {
    if (!this.product) return;
    
    this.cartService.addToCart({
      productId: this.product.id,
      quantity: this.quantity,
      selectedVariant: this.selectedVariant?.variantValue
    }).subscribe({
      next: () => {
        alert('Product added to cart successfully!');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart');
      }
    });
  }

  isInWishlist(): boolean {
    return this.product ? this.productService.isInWishlist(this.product.id) : false;
  }

  toggleWishlist(): void {
    if (!this.product) return;
    
    this.productService.toggleWishlist(this.product.id).subscribe({
      error: (error) => {
        console.error('Error toggling wishlist:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/products']);
  }
}
