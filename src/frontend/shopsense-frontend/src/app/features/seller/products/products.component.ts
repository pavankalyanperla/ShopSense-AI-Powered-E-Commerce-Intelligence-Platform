import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductDto, CategoryDto } from '../../../core/models/product.models';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, InputTextModule, 
            ConfirmDialogModule, DialogModule, InputNumberModule, DropdownModule, ToastModule],
  template: `
    <div class="ss-page">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="ss-section-title m-0">My Products</h1>
          <p class="text-500 text-sm m-0 mt-1">{{ products.length }} listings</p>
        </div>
        <p-button label="Add New Product" icon="pi pi-plus" (onClick)="showAddDialog = true"></p-button>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && products.length === 0" class="text-center py-8">
        <i class="pi pi-box text-6xl text-300 mb-4 block"></i>
        <h3 class="text-xl font-medium text-700 mb-2">No products listed yet</h3>
        <p class="text-500 mb-4">Start listing your products to reach millions of Indian shoppers</p>
        <p-button label="Add Your First Product" icon="pi pi-plus" (onClick)="showAddDialog = true"></p-button>
      </div>

      <!-- Products table -->
      <div *ngIf="products.length > 0" class="ss-card p-0 overflow-hidden">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>
                <div class="flex align-items-center gap-3">
                  <img [src]="p.primaryImageUrl" [alt]="p.name"
                       style="width:48px;height:48px;object-fit:cover;border-radius:8px"
                       onerror="this.src='https://via.placeholder.com/48'"/>
                  <div>
                    <p class="font-medium m-0 text-sm" 
                       style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                      {{ p.name }}
                    </p>
                    <p class="text-400 text-xs m-0">{{ p.brand }}</p>
                  </div>
                </div>
              </td>
              <td class="text-sm text-600">{{ p.categoryName }}</td>
              <td>
                <p class="font-bold m-0 text-sm">₹{{ (p.discountedPrice || p.basePrice) | number:'1.0-0' }}</p>
                <p *ngIf="p.discountedPrice" class="text-400 line-through text-xs m-0">
                  ₹{{ p.basePrice | number:'1.0-0' }}
                </p>
              </td>
              <td>
                <span [class]="getStockClass(p.stockQuantity)">{{ p.stockQuantity }} units</span>
              </td>
              <td>
                <div class="flex align-items-center gap-1">
                  <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                  <span class="text-sm">{{ p.averageRating.toFixed(1) }}</span>
                  <span class="text-400 text-xs">({{ p.reviewCount }})</span>
                </div>
              </td>
              <td>
                <p-tag [value]="p.isActive ? 'Active' : 'Inactive'" 
                       [severity]="p.isActive ? 'success' : 'secondary'" styleClass="text-xs"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button icon="pi pi-pencil" styleClass="p-button-text p-button-sm" 
                            pTooltip="Edit" (onClick)="onEdit(p)"></p-button>
                  <p-button icon="pi pi-star" styleClass="p-button-text p-button-sm p-button-help" 
                            pTooltip="AI Coach" (onClick)="onCoach(p)"></p-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Product Dialog -->
      <p-dialog [(visible)]="showAddDialog" header="Add New Product" [modal]="true" 
                [style]="{width:'600px'}" [draggable]="false">
        <div class="flex flex-column gap-3 pt-2">
          <div class="grid">
            <div class="col-12 flex flex-column gap-1">
              <label class="text-sm font-medium">Product Name *</label>
              <input pInputText [(ngModel)]="newProduct.name" 
                     placeholder="Full product name with brand and key specs"/>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Category *</label>
              <p-dropdown [options]="categories" [(ngModel)]="newProduct.categoryId" 
                          optionLabel="name" optionValue="id" placeholder="Select" styleClass="w-full"></p-dropdown>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Brand *</label>
              <input pInputText [(ngModel)]="newProduct.brand" placeholder="Brand name"/>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Base Price (₹) *</label>
              <p-inputNumber [(ngModel)]="newProduct.basePrice" prefix="₹" styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Discounted Price (₹)</label>
              <p-inputNumber [(ngModel)]="newProduct.discountedPrice" prefix="₹" styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Stock Quantity *</label>
              <p-inputNumber [(ngModel)]="newProduct.stockQuantity" [min]="0" styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">SKU</label>
              <input pInputText [(ngModel)]="newProduct.sku" placeholder="Auto-generated if empty"/>
            </div>
            <div class="col-12 flex flex-column gap-1">
              <label class="text-sm font-medium">Description *</label>
              <textarea pInputText [(ngModel)]="newProduct.description" rows="3"
                        placeholder="Describe your product in detail (min 50 words for better AI Listing Coach score)"
                        style="resize:vertical"></textarea>
            </div>
            <div class="col-12 flex flex-column gap-1">
              <label class="text-sm font-medium">Image URLs (comma separated)</label>
              <input pInputText [(ngModel)]="imageUrlsInput" placeholder="https://..., https://..."/>
            </div>
          </div>
          <div *ngIf="addError" class="ss-error-msg">{{ addError }}</div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" styleClass="p-button-text" (onClick)="showAddDialog = false"></p-button>
          <p-button label="Add Product" [loading]="addingProduct" (onClick)="onAddProduct()"></p-button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .ss-table { border-collapse: collapse; }
    .ss-table th {
      background: #F8FAFC; padding: .75rem 1rem; text-align: left; font-size: .75rem;
      font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em;
      border-bottom: 1px solid #E2E8F0;
    }
    .ss-table td { padding: .75rem 1rem; border-bottom: 1px solid #F1F5F9; }
    .ss-table tr:hover td { background: #F8FAFC; }
    .stock-none { color: #EF4444; }
    .stock-low { color: #F59E0B; }
    .stock-high { color: #10B981; }
  `]
})
export class SellerProductsComponent implements OnInit {
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loading = true;
  showAddDialog = false;
  addingProduct = false;
  addError = '';
  imageUrlsInput = '';
  
  newProduct = {
    name: '', brand: '', categoryId: '', basePrice: 0, 
    discountedPrice: undefined as number | undefined,
    stockQuantity: 0, description: '', sku: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserSignal();
    if (user) {
      this.productService.getProducts({ sellerId: user.id, pageSize: 100 } as any).subscribe({
        next: r => { this.products = r.items; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
    
    this.productService.getCategories().subscribe({
      next: cats => this.categories = cats
    });
  }

  onAddProduct() {
    if (!this.newProduct.name || !this.newProduct.categoryId || 
        !this.newProduct.basePrice || !this.newProduct.stockQuantity) {
      this.addError = 'Please fill all required fields';
      return;
    }
    
    this.addingProduct = true;
    this.addError = '';
    
    const imageUrls = this.imageUrlsInput.split(',').map(u => u.trim()).filter(u => u);
    
    this.productService.createProduct({
      name: this.newProduct.name,
      description: this.newProduct.description,
      brand: this.newProduct.brand,
      categoryId: this.newProduct.categoryId,
      basePrice: this.newProduct.basePrice,
      discountedPrice: this.newProduct.discountedPrice,
      stockQuantity: this.newProduct.stockQuantity,
      lowStockThreshold: 10,
      sku: this.newProduct.sku,
      isFeatured: false,
      imageUrls,
      variants: [],
      specifications: []
    }).subscribe({
      next: p => {
        this.products.unshift(p);
        this.showAddDialog = false;
        this.addingProduct = false;
        this.newProduct = { name: '', brand: '', categoryId: '', basePrice: 0, 
                           discountedPrice: undefined, stockQuantity: 0, description: '', sku: '' };
        this.imageUrlsInput = '';
      },
      error: err => {
        this.addingProduct = false;
        this.addError = err.error?.message || 'Failed to add product';
      }
    });
  }

  onEdit(p: ProductDto) {
    console.log('Edit:', p.id);
  }

  onCoach(p: ProductDto) {
    this.router.navigate(['/seller/listing-coach']);
  }

  getStockClass(qty: number): string {
    if (qty === 0) return 'stock-none font-medium';
    if (qty <= 10) return 'stock-low font-medium';
    return 'stock-high font-medium';
  }
}
