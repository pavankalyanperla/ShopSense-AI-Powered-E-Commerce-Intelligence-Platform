import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import {
  CartDto,
  Address,
  CreateAddressRequest,
  CheckoutRequest,
  Coupon,
  CouponValidationResult
} from '../../../core/models/order.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-container">
      <h1>Checkout</h1>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading" class="checkout-content">
        <!-- Delivery Address Section -->
        <div class="section">
          <h2>1. Delivery Address</h2>
          
          <div *ngIf="addresses.length > 0" class="addresses-list">
            <div *ngFor="let addr of addresses" 
                 class="address-card" 
                 [class.selected]="selectedAddressId === addr.id"
                 (click)="selectAddress(addr.id)">
              <input type="radio" 
                     [checked]="selectedAddressId === addr.id"
                     name="address">
              <div class="address-details">
                <h3>{{ addr.fullName }}</h3>
                <p>{{ addr.addressLine1 }}</p>
                <p *ngIf="addr.addressLine2">{{ addr.addressLine2 }}</p>
                <p>{{ addr.city }}, {{ addr.state }} - {{ addr.pinCode }}</p>
                <p>Phone: {{ addr.phoneNumber }}</p>
                <span *ngIf="addr.isDefault" class="badge">Default</span>
              </div>
            </div>
          </div>

          <button class="btn-secondary" (click)="showAddressForm = !showAddressForm">
            {{ showAddressForm ? 'Cancel' : '+ Add New Address' }}
          </button>

          <div *ngIf="showAddressForm" class="address-form">
            <h3>Add New Address</h3>
            <form (ngSubmit)="addAddress()">
              <div class="form-row">
                <input type="text" [(ngModel)]="newAddress.fullName" name="fullName" 
                       placeholder="Full Name" required>
                <input type="tel" [(ngModel)]="newAddress.phoneNumber" name="phoneNumber" 
                       placeholder="Phone Number" required>
              </div>
              <input type="text" [(ngModel)]="newAddress.addressLine1" name="addressLine1" 
                     placeholder="Address Line 1" required>
              <input type="text" [(ngModel)]="newAddress.addressLine2" name="addressLine2" 
                     placeholder="Address Line 2 (Optional)">
              <div class="form-row">
                <input type="text" [(ngModel)]="newAddress.city" name="city" 
                       placeholder="City" required>
                <input type="text" [(ngModel)]="newAddress.state" name="state" 
                       placeholder="State" required>
                <input type="text" [(ngModel)]="newAddress.pinCode" name="pinCode" 
                       placeholder="PIN Code" required>
              </div>
              <label>
                <input type="checkbox" [(ngModel)]="newAddress.isDefault" name="isDefault">
                Set as default address
              </label>
              <button type="submit" class="btn-primary">Save Address</button>
            </form>
          </div>
        </div>

        <!-- Payment Method Section -->
        <div class="section">
          <h2>2. Payment Method</h2>
          <div class="payment-methods">
            <label class="payment-option">
              <input type="radio" [(ngModel)]="paymentMethod" value="COD" name="payment">
              <div>
                <i class="fas fa-money-bill-wave"></i>
                <span>Cash on Delivery</span>
              </div>
            </label>
            <label class="payment-option">
              <input type="radio" [(ngModel)]="paymentMethod" value="UPI" name="payment">
              <div>
                <i class="fas fa-mobile-alt"></i>
                <span>UPI</span>
              </div>
            </label>
            <label class="payment-option">
              <input type="radio" [(ngModel)]="paymentMethod" value="Card" name="payment">
              <div>
                <i class="fas fa-credit-card"></i>
                <span>Credit/Debit Card</span>
              </div>
            </label>
            <label class="payment-option">
              <input type="radio" [(ngModel)]="paymentMethod" value="NetBanking" name="payment">
              <div>
                <i class="fas fa-university"></i>
                <span>Net Banking</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Order Summary Section -->
        <div class="section order-summary">
          <h2>3. Order Summary</h2>
          
          <div *ngIf="cart" class="summary-items">
            <p class="items-count">{{ cart.totalItems }} {{ cart.totalItems === 1 ? 'item' : 'items' }}</p>
            
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ cart.subTotal.toFixed(2) }}</span>
            </div>

            <!-- Coupon Section -->
            <div class="coupon-section">
              <div class="coupon-input">
                <input type="text" 
                       [(ngModel)]="couponCode" 
                       placeholder="Enter coupon code"
                       [disabled]="couponApplied">
                <button (click)="applyCoupon()" 
                        [disabled]="!couponCode || couponApplied"
                        class="btn-apply">
                  {{ couponApplied ? 'Applied' : 'Apply' }}
                </button>
              </div>
              <p *ngIf="couponMessage" [class.error]="!couponValid" [class.success]="couponValid">
                {{ couponMessage }}
              </p>
              <button *ngIf="couponApplied" (click)="removeCoupon()" class="btn-remove-coupon">
                Remove Coupon
              </button>
            </div>

            <div *ngIf="discountAmount > 0" class="summary-row discount">
              <span>Discount</span>
              <span>-₹{{ discountAmount.toFixed(2) }}</span>
            </div>

            <div class="summary-row">
              <span>Delivery Charges</span>
              <span>{{ getDeliveryCharge() === 0 ? 'FREE' : '₹' + getDeliveryCharge().toFixed(2) }}</span>
            </div>

            <div class="summary-row total">
              <span>Total Amount</span>
              <span>₹{{ getFinalTotal().toFixed(2) }}</span>
            </div>
          </div>

          <button class="btn-place-order" 
                  (click)="placeOrder()"
                  [disabled]="!selectedAddressId || !paymentMethod || placingOrder">
            {{ placingOrder ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #666;
    }

    .checkout-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;

      h2 {
        font-size: 1.3rem;
        margin-bottom: 1.5rem;
        color: #2c3e50;
      }
    }

    .addresses-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .address-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &.selected {
        border-color: #3498db;
        background: #f8f9fa;
      }

      &:hover {
        border-color: #3498db;
      }

      input[type="radio"] {
        margin-top: 0.25rem;
      }

      .address-details {
        flex: 1;

        h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        p {
          margin: 0.25rem 0;
          color: #666;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #27ae60;
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
      }
    }

    .address-form {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;

      h3 {
        margin-bottom: 1rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        input[type="text"],
        input[type="tel"] {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:has(input:checked) {
        border-color: #3498db;
        background: #f8f9fa;
      }

      &:hover {
        border-color: #3498db;
      }

      div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;

        i {
          font-size: 1.5rem;
          color: #3498db;
        }
      }
    }

    .order-summary {
      .items-count {
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;

        &.discount {
          color: #27ae60;
          font-weight: 600;
        }

        &.total {
          font-size: 1.3rem;
          font-weight: 600;
          padding-top: 1rem;
          border-top: 2px solid #e0e0e0;
          margin-top: 1rem;
        }
      }
    }

    .coupon-section {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;

      .coupon-input {
        display: flex;
        gap: 0.5rem;

        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .btn-apply {
          padding: 0.75rem 1.5rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;

          &:hover:not(:disabled) {
            background: #2980b9;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }

      p {
        margin-top: 0.5rem;
        font-size: 0.9rem;

        &.error {
          color: #e74c3c;
        }

        &.success {
          color: #27ae60;
        }
      }

      .btn-remove-coupon {
        margin-top: 0.5rem;
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

    .btn-primary, .btn-secondary, .btn-place-order {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3498db;
      color: white;

      &:hover {
        background: #2980b9;
      }
    }

    .btn-secondary {
      background: white;
      color: #3498db;
      border: 1px solid #3498db;

      &:hover {
        background: #f8f9fa;
      }
    }

    .btn-place-order {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 1.5rem;

      &:hover:not(:disabled) {
        background: #229954;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: CartDto | null = null;
  addresses: Address[] = [];
  selectedAddressId: string = '';
  paymentMethod: 'COD' | 'UPI' | 'Card' | 'NetBanking' = 'COD';
  
  showAddressForm = false;
  newAddress: CreateAddressRequest = {
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    isDefault: false
  };

  couponCode = '';
  couponApplied = false;
  couponValid = false;
  couponMessage = '';
  discountAmount = 0;

  loading = true;
  placingOrder = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    Promise.all([
      this.cartService.getCart().toPromise(),
      this.cartService.getAddresses().toPromise()
    ]).then(([cart, addresses]) => {
      this.cart = cart!;
      this.addresses = addresses!;
      
      // Select default address
      const defaultAddr = this.addresses.find(a => a.isDefault);
      if (defaultAddr) {
        this.selectedAddressId = defaultAddr.id;
      }
      
      this.loading = false;
    }).catch(error => {
      console.error('Error loading checkout data:', error);
      this.loading = false;
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  addAddress(): void {
    this.cartService.createAddress(this.newAddress).subscribe({
      next: (address) => {
        this.addresses.push(address);
        this.selectedAddressId = address.id;
        this.showAddressForm = false;
        this.resetAddressForm();
      },
      error: (error) => {
        console.error('Error adding address:', error);
        alert('Failed to add address');
      }
    });
  }

  resetAddressForm(): void {
    this.newAddress = {
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pinCode: '',
      isDefault: false
    };
  }

  applyCoupon(): void {
    if (!this.cart || !this.couponCode) return;

    this.cartService.validateCoupon({
      code: this.couponCode,
      orderAmount: this.cart.subTotal
    }).subscribe({
      next: (result) => {
        this.couponValid = result.isValid;
        this.couponMessage = result.message;
        
        if (result.isValid) {
          this.couponApplied = true;
          this.discountAmount = result.discountAmount;
        }
      },
      error: (error) => {
        console.error('Error validating coupon:', error);
        this.couponValid = false;
        this.couponMessage = 'Invalid coupon code';
      }
    });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponApplied = false;
    this.couponValid = false;
    this.couponMessage = '';
    this.discountAmount = 0;
  }

  getDeliveryCharge(): number {
    if (!this.cart) return 0;
    const afterDiscount = this.cart.subTotal - this.discountAmount;
    return afterDiscount >= 499 ? 0 : 40;
  }

  getFinalTotal(): number {
    if (!this.cart) return 0;
    return this.cart.subTotal - this.discountAmount + this.getDeliveryCharge();
  }

  placeOrder(): void {
    if (!this.selectedAddressId || !this.paymentMethod) {
      alert('Please select delivery address and payment method');
      return;
    }

    this.placingOrder = true;

    const request: CheckoutRequest = {
      deliveryAddressId: this.selectedAddressId,
      paymentMethod: this.paymentMethod,
      couponCode: this.couponApplied ? this.couponCode : undefined
    };

    this.cartService.checkout(request).subscribe({
      next: (order) => {
        this.placingOrder = false;
        alert(`Order placed successfully! Order Number: ${order.orderNumber}`);
        this.router.navigate(['/customer/orders']);
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.placingOrder = false;
        alert('Failed to place order. Please try again.');
      }
    });
  }
}
