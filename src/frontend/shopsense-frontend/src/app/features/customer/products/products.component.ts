import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto, CategoryDto, ProductQueryParams } from '../../../core/models/product.models';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    SliderModule,
    RatingModule,
    TagModule,
    PaginatorModule,
    SkeletonModule,
    CheckboxModule,
    TooltipModule
  ],
  template: `
    <div class="products-container">
      <!-- Header -->
      <div class="products-header">
        <h1>Browse Products</h1>
        <p>Discover amazing products from trusted sellers across India</p>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-row">
          <!-- Search -->
          <span class="p-input-icon-left search-box">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="onSearchChange()"
              placeholder="Search products..." 
              class="w-full" />
          </span>

          <!-- Category Filter -->
          <p-dropdown 
            [options]="categories" 
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onFilterChange()"
            optionLabel="name" 
            optionValue="id"
            placeholder="All Categories"
            [showClear]="true"
            class="category-dropdown">
          </p-dropdown>

          <!-- Sort By -->
          <p-dropdown 
            [options]="sortOptions" 
            [(ngModel)]="selectedSort"
            (ngModelChange)="onSortChange()"
            optionLabel="label" 
            optionValue="value"
            placeholder="Sort By"
            class="sort-dropdown">
          </p-dropdown>

          <!-- In Stock Only -->
          <div class="stock-filter">
            <p-checkbox 
              [(ngModel)]="inStockOnly" 
              (ngModelChange)="onFilterChange()"
              [binary]="true" 
              inputId="inStock">
            </p-checkbox>
            <label for="inStock" class="ml-2">In Stock Only</label>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="price-filter">
          <label>Price Range: ₹{{priceRange[0]}} - ₹{{priceRange[1]}}</label>
          <p-slider 
            [(ngModel)]="priceRange" 
            (onSlideEnd)="onFilterChange()"
            [range]="true" 
            [min]="0" 
            [max]="200000" 
            [step]="1000"
            class="w-full">
          </p-slider>
        </div>

        <!-- Rating Filter -->
        <div class="rating-filter">
          <label>Minimum Rating:</label>
          <p-rating 
            [(ngModel)]="minRating" 
            (ngModelChange)="onFilterChange()">
          </p-rating>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="loading" class="products-grid">
        <p-card *ngFor="let item of [1,2,3,4,5,6,7,8]" class="product-card">
          <p-skeleton width="100%" height="200px"></p-skeleton>
          <p-skeleton width="80%" height="1.5rem" styleClass="mt-3"></p-skeleton>
          <p-skeleton width="60%" height="1rem" styleClass="mt-2"></p-skeleton>
          <p-skeleton width="40%" height="1.5rem" styleClass="mt-2"></p-skeleton>
        </p-card>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading && products.length > 0" class="products-grid">
        <p-card *ngFor="let product of products" class="product-card" (click)="viewProduct(product.slug)">
          <!-- Product Image -->
          <div class="product-image">
            <img [src]="product.primaryImageUrl" [alt]="product.name" />
            <p-tag *ngIf="product.discountPercent > 0" severity="success" [value]="product.discountPercent + '% OFF'" class="discount-badge"></p-tag>
            <button 
              pButton 
              icon="pi pi-heart" 
              [class.pi-heart-fill]="isInWishlist(product.id)"
              class="wishlist-btn"
              (click)="toggleWishlist($event, product.id)"
              [pTooltip]="isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'">
            </button>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-brand">{{ product.brand }}</p>
            
            <!-- Rating -->
            <div class="product-rating">
              <p-rating 
                [ngModel]="product.averageRating" 
                [readonly]="true">
              </p-rating>
              <span class="review-count">({{ product.reviewCount }})</span>
            </div>

            <!-- Price -->
            <div class="product-price">
              <span class="current-price">₹{{ product.discountedPrice || product.basePrice | number:'1.0-0' }}</span>
              <span *ngIf="product.discountedPrice" class="original-price">₹{{ product.basePrice | number:'1.0-0' }}</span>
            </div>

            <!-- Stock Status -->
            <p-tag 
              *ngIf="product.stockQuantity === 0" 
              severity="danger" 
              value="Out of Stock">
            </p-tag>
            <p-tag 
              *ngIf="product.stockQuantity > 0 && product.stockQuantity < 10" 
              severity="warning" 
              [value]="'Only ' + product.stockQuantity + ' left'">
            </p-tag>
          </div>
        </p-card>
      </div>

      <!-- No Results -->
      <div *ngIf="!loading && products.length === 0" class="no-results">
        <i class="pi pi-inbox" style="font-size: 4rem; color: var(--text-color-secondary);"></i>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>

      <!-- Pagination -->
      <p-paginator 
        *ngIf="!loading && totalRecords > 0"
        [rows]="pageSize" 
        [totalRecords]="totalRecords"
        [first]="(currentPage - 1) * pageSize"
        (onPageChange)="onPageChange($event)"
        [rowsPerPageOptions]="[12, 24, 48]">
      </p-paginator>
    </div>
  `,
  styles: [`
    .products-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .products-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .products-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }

    .products-header p {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }

    .filters-section {
      background: var(--surface-card);
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-box {
      width: 100%;
    }

    .stock-filter {
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .price-filter, .rating-filter {
      margin-top: 1rem;
    }

    .price-filter label, .rating-filter label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge {
      position: absolute;
      top: 10px;
      left: 10px;
    }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .wishlist-btn.pi-heart-fill {
      color: #e74c3c;
    }

    .product-info {
      padding: 0.5rem;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-brand {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .review-count {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .current-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .original-price {
      font-size: 1rem;
      text-decoration: line-through;
      color: var(--text-color-secondary);
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-results h3 {
      margin-top: 1rem;
      font-size: 1.5rem;
    }

    .no-results p {
      color: var(--text-color-secondary);
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loading = true;
  
  // Filters
  searchQuery = '';
  selectedCategory: string | null = null;
  priceRange: number[] = [0, 200000];
  minRating: number | null = null;
  inStockOnly = false;
  
  // Sorting
  selectedSort = 'name';
  sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating', value: 'rating' },
    { label: 'Newest First', value: 'newest' }
  ];
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalRecords = 0;
  
  private searchTimeout: any;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    const query: ProductQueryParams = {
      search: this.searchQuery || undefined,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.priceRange[0],
      maxPrice: this.priceRange[1],
      minRating: this.minRating || undefined,
      inStock: this.inStockOnly || undefined,
      sortBy: this.getSortField(),
      sortDesc: this.getSortDirection(),
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.getProducts(query).subscribe({
      next: (result) => {
        this.products = result.items;
        this.totalRecords = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSortField(): string {
    switch (this.selectedSort) {
      case 'price':
      case 'price_desc':
        return 'price';
      case 'rating':
        return 'rating';
      case 'newest':
        return 'createdAt';
      default:
        return 'name';
    }
  }

  getSortDirection(): boolean {
    return this.selectedSort === 'price_desc' || this.selectedSort === 'rating' || this.selectedSort === 'newest';
  }

  viewProduct(slug: string): void {
    this.router.navigate(['/customer/products', slug]);
  }

  isInWishlist(productId: string): boolean {
    return this.productService.isInWishlist(productId);
  }

  toggleWishlist(event: Event, productId: string): void {
    event.stopPropagation();
    this.productService.toggleWishlist(productId).subscribe({
      error: (error) => {
        console.error('Error toggling wishlist:', error);
      }
    });
  }
}
