import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartDto, CartItem } from '../../../core/models/order.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1>Shopping Cart</h1>
        <p *ngIf="cart">{{ cart.totalItems }} {{ cart.totalItems === 1 ? 'item' : 'items' }}</p>
      </div>

      <div *ngIf="loading" class="loading">Loading cart...</div>

      <div *ngIf="!loading && cart && cart.items.length === 0" class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h2>Your cart is empty</h2>
        <p>Add items to get started</p>
        <button class="btn-primary" routerLink="/customer/products">Continue Shopping</button>
      </div>

      <div *ngIf="!loading && cart && cart.items.length > 0" class="cart-content">
        <div class="cart-items">
          <div *ngFor="let item of cart.items" class="cart-item">
            <img [src]="item.productImage" [alt]="item.productName" class="item-image">
            
            <div class="item-details">
              <h3>{{ item.productName }}</h3>
              <p *ngIf="item.selectedVariant" class="variant">{{ item.selectedVariant }}</p>
              <p class="price">₹{{ item.unitPrice.toFixed(2) }}</p>
            </div>

            <div class="item-quantity">
              <button (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                <i class="fas fa-minus"></i>
              </button>
              <span>{{ item.quantity }}</span>
              <button (click)="updateQuantity(item, item.quantity + 1)" [disabled]="item.quantity >= 10">
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <div class="item-total">
              <p class="total-price">₹{{ (item.unitPrice * item.quantity).toFixed(2) }}</p>
              <button class="btn-remove" (click)="removeItem(item.id)">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          
          <div class="summary-row">
            <span>Subtotal ({{ cart.totalItems }} items)</span>
            <span>₹{{ cart.subTotal.toFixed(2) }}</span>
          </div>

          <div class="summary-row">
            <span>Delivery Charges</span>
            <span>{{ cart.subTotal >= 499 ? 'FREE' : '₹40.00' }}</span>
          </div>

          <div class="summary-row total">
            <span>Total Amount</span>
            <span>₹{{ getTotal().toFixed(2) }}</span>
          </div>

          <button class="btn-checkout" (click)="proceedToCheckout()">
            Proceed to Checkout
          </button>

          <button class="btn-continue" routerLink="/customer/products">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .cart-header {
      margin-bottom: 2rem;
      
      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: #666;
      }
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #666;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      
      i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 1rem;
      }
      
      h2 {
        margin-bottom: 0.5rem;
      }
      
      p {
        color: #666;
        margin-bottom: 2rem;
      }
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      align-items: center;
      
      @media (max-width: 768px) {
        grid-template-columns: 80px 1fr;
        
        .item-quantity, .item-total {
          grid-column: 2;
        }
      }
    }

    .item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details {
      h3 {
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
      }
      
      .variant {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      
      .price {
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      button {
        width: 32px;
        height: 32px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover:not(:disabled) {
          background: #f5f5f5;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      
      span {
        min-width: 30px;
        text-align: center;
        font-weight: 600;
      }
    }

    .item-total {
      text-align: right;
      
      .total-price {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .btn-remove {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        font-size: 0.9rem;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .cart-summary {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
      
      h2 {
        font-size: 1.3rem;
        margin-bottom: 1.5rem;
      }
      
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        
        &.total {
          font-size: 1.2rem;
          font-weight: 600;
          padding-top: 1rem;
          border-top: 2px solid #e0e0e0;
          margin-top: 1rem;
        }
      }
      
      .btn-checkout {
        width: 100%;
        padding: 1rem;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1.5rem;
        
        &:hover {
          background: #229954;
        }
      }
      
      .btn-continue {
        width: 100%;
        padding: 0.75rem;
        background: white;
        color: #3498db;
        border: 1px solid #3498db;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        margin-top: 0.5rem;
        
        &:hover {
          background: #f8f9fa;
        }
      }
    }

    .btn-primary {
      padding: 0.75rem 2rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      
      &:hover {
        background: #2980b9;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: CartDto | null = null;
  loading = true;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: (cart) => {
        this.cart = cart;
      },
      error: (error) => {
        console.error('Error updating cart:', error);
      }
    });
  }

  removeItem(cartItemId: string): void {
    if (!confirm('Remove this item from cart?')) return;
    
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  getTotal(): number {
    if (!this.cart) return 0;
    const deliveryCharge = this.cart.subTotal >= 499 ? 0 : 40;
    return this.cart.subTotal + deliveryCharge;
  }

  proceedToCheckout(): void {
    this.router.navigate(['/customer/checkout']);
  }
}
