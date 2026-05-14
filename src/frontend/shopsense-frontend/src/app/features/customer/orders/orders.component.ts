import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Order, OrderStatus } from '../../../core/models/order.models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-container">
      <h1>My Orders</h1>

      <div *ngIf="loading" class="loading">Loading orders...</div>

      <div *ngIf="!loading && orders.length === 0" class="empty-orders">
        <i class="fas fa-box-open"></i>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here</p>
        <button class="btn-primary" routerLink="/customer/products">Browse Products</button>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="orders-list">
        <div *ngFor="let order of orders" class="order-card">
          <div class="order-header">
            <div>
              <h3>Order #{{ order.orderNumber }}</h3>
              <p class="order-date">{{ order.createdAt | date:'medium' }}</p>
            </div>
            <span class="status-badge" [class]="getStatusClass(order.status)">
              {{ order.status }}
            </span>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.items" class="order-item">
              <img [src]="item.productImage" [alt]="item.productName">
              <div class="item-info">
                <h4>{{ item.productName }}</h4>
                <p *ngIf="item.selectedVariant">{{ item.selectedVariant }}</p>
                <p>Qty: {{ item.quantity }} × ₹{{ item.unitPrice.toFixed(2) }}</p>
              </div>
              <div class="item-price">
                ₹{{ item.finalPrice.toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>Total Amount:</span>
              <span class="amount">₹{{ order.totalAmount.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <button *ngIf="canCancel(order)" 
                      class="btn-cancel" 
                      (click)="cancelOrder(order.id)">
                Cancel Order
              </button>
              <button class="btn-details" 
                      (click)="viewOrderDetails(order.id)">
                View Details
              </button>
            </div>
          </div>

          <div class="delivery-address">
            <h4>Delivery Address</h4>
            <p>{{ order.deliveryAddress.fullName }}</p>
            <p>{{ order.deliveryAddress.addressLine1 }}</p>
            <p *ngIf="order.deliveryAddress.addressLine2">{{ order.deliveryAddress.addressLine2 }}</p>
            <p>{{ order.deliveryAddress.city }}, {{ order.deliveryAddress.state }} - {{ order.deliveryAddress.pinCode }}</p>
            <p>Phone: {{ order.deliveryAddress.phoneNumber }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1200px;
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

    .empty-orders {
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

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;

      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.25rem;
      }

      .order-date {
        color: #666;
        font-size: 0.9rem;
      }
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;

      &.pending { background: #fff3cd; color: #856404; }
      &.confirmed { background: #d1ecf1; color: #0c5460; }
      &.processing { background: #cce5ff; color: #004085; }
      &.shipped { background: #d4edda; color: #155724; }
      &.delivered { background: #d4edda; color: #155724; }
      &.cancelled { background: #f8d7da; color: #721c24; }
      &.returned { background: #f8d7da; color: #721c24; }
    }

    .order-items {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 1rem;
      align-items: center;

      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
      }

      .item-info {
        h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.9rem;
          color: #666;
          margin: 0.25rem 0;
        }
      }

      .item-price {
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;

      .order-total {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .amount {
          font-size: 1.3rem;
          font-weight: 600;
          color: #27ae60;
        }
      }

      .order-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .delivery-address {
      padding: 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;

      h4 {
        margin-bottom: 0.5rem;
        font-size: 1rem;
      }

      p {
        margin: 0.25rem 0;
        color: #666;
        font-size: 0.9rem;
      }
    }

    .btn-primary, .btn-cancel, .btn-details {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
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

    .btn-cancel {
      background: #e74c3c;
      color: white;

      &:hover {
        background: #c0392b;
      }
    }

    .btn-details {
      background: white;
      color: #3498db;
      border: 1px solid #3498db;

      &:hover {
        background: #f8f9fa;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.cartService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase();
  }

  canCancel(order: Order): boolean {
    return order.status === OrderStatus.Pending || order.status === OrderStatus.Confirmed;
  }

  cancelOrder(orderId: string): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.cartService.cancelOrder(orderId).subscribe({
      next: () => {
        alert('Order cancelled successfully');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
      }
    });
  }

  viewOrderDetails(orderId: string): void {
    // Navigate to order details page or show modal
    console.log('View order details:', orderId);
  }
}
