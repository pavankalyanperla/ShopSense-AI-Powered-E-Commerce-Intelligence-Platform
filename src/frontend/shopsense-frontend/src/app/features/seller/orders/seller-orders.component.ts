import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, DropdownModule, DialogModule],
  template: `
    <div class="ss-page">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="ss-section-title m-0">Seller Orders</h1>
        <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus" optionLabel="label" optionValue="value"
                    (onChange)="onStatusFilter()" placeholder="All Statuses" styleClass="text-sm"></p-dropdown>
      </div>

      <div *ngIf="orders.length === 0 && !loading" class="text-center py-8">
        <i class="pi pi-shopping-bag text-6xl text-300 mb-4 block"></i>
        <p class="text-500">No orders yet</p>
      </div>

      <div class="ss-card p-0 overflow-hidden" *ngIf="orders.length > 0">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders">
              <td class="font-mono text-sm font-bold text-blue-700">{{ o.orderNumber }}</td>
              <td class="text-sm">{{ o.customerName }}</td>
              <td class="text-sm">{{ o.items.length }} item(s)</td>
              <td class="font-semibold text-sm">₹{{ o.totalAmount | number:'1.0-0' }}</td>
              <td><p-tag [value]="o.paymentMethod" severity="info" styleClass="text-xs"></p-tag></td>
              <td><p-tag [value]="o.status" [severity]="getStatusSeverity(o.status)" styleClass="text-xs"></p-tag></td>
              <td class="text-sm text-500">{{ o.createdAt | date:'dd MMM yy' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" styleClass="p-button-text p-button-sm" pTooltip="View details"
                            (onClick)="selectedOrder = o; showDetail = true"></p-button>
                  <p-button *ngIf="o.status === 'Confirmed'" icon="pi pi-send" 
                            styleClass="p-button-text p-button-sm p-button-success" pTooltip="Mark as Shipped"
                            (onClick)="updateStatus(o, 'Shipped')"></p-button>
                  <p-button *ngIf="o.status === 'Shipped'" icon="pi pi-check" 
                            styleClass="p-button-text p-button-sm p-button-success" pTooltip="Mark as Delivered"
                            (onClick)="updateStatus(o, 'Delivered')"></p-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Order Detail Dialog -->
      <p-dialog [(visible)]="showDetail" [header]="'Order ' + selectedOrder?.orderNumber" 
                [modal]="true" [style]="{width:'560px'}">
        <div *ngIf="selectedOrder" class="pt-2">
          <div class="grid mb-3">
            <div class="col-6">
              <p class="text-500 text-xs m-0">Customer</p>
              <p class="font-medium m-0">{{ selectedOrder.customerName }}</p>
            </div>
            <div class="col-6">
              <p class="text-500 text-xs m-0">Delivery Address</p>
              <p class="text-sm m-0">{{ selectedOrder.deliveryAddress?.city }}, 
                 {{ selectedOrder.deliveryAddress?.state }} — {{ selectedOrder.deliveryAddress?.pincode }}</p>
            </div>
          </div>
          <div *ngFor="let item of selectedOrder.items" class="flex gap-3 mb-3 p-3 bg-surface-50 border-round-lg">
            <img [src]="item.productImageUrl" style="width:60px;height:60px;object-fit:cover;border-radius:8px"
                 onerror="this.src='https://via.placeholder.com/60'"/>
            <div class="flex-1">
              <p class="font-medium text-sm m-0">{{ item.productName }}</p>
              <p class="text-500 text-xs m-0">Qty: {{ item.quantity }} × ₹{{ item.unitPrice | number:'1.0-0' }}</p>
            </div>
            <p class="font-bold m-0">₹{{ item.finalPrice | number:'1.0-0' }}</p>
          </div>
          <div class="flex justify-content-between font-bold text-lg pt-2 border-top-1 border-200">
            <span>Total</span>
            <span>₹{{ selectedOrder.totalAmount | number:'1.0-0' }}</span>
          </div>
        </div>
      </p-dialog>
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
  `]
})
export class SellerOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = true;
  selectedStatus = '';
  showDetail = false;
  selectedOrder: any = null;
  
  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Placed', value: 'Placed' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getSellerOrders().subscribe({
      next: o => { this.orders = o; this.filteredOrders = o; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onStatusFilter() {
    this.filteredOrders = this.selectedStatus 
      ? this.orders.filter(o => o.status === this.selectedStatus)
      : this.orders;
  }

  updateStatus(order: any, status: string) {
    this.cartService.updateOrderStatus(order.id, status).subscribe({
      next: updated => {
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx > -1) this.orders[idx] = updated;
        this.onStatusFilter();
      }
    });
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      Placed: 'info', Confirmed: 'info', Shipped: 'warning', 
      OutForDelivery: 'warning', Delivered: 'success', Cancelled: 'danger'
    };
    return map[status] || 'info';
  }
}
