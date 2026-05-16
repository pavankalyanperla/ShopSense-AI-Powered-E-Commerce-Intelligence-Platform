import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule,
            DropdownModule, DialogModule, InputTextModule, SkeletonModule],
  template: `
    <div>
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">All Orders</h1>
          <p class="text-500 text-sm m-0 mt-1">{{ filteredOrders.length }} orders</p>
        </div>
        <div class="flex gap-2 align-items-center">
          <input pInputText [(ngModel)]="searchTerm" placeholder="Search order #..."
                 (input)="onFilter()" style="width:200px"/>
          <div style="width:160px">
            <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus"
                        optionLabel="label" optionValue="value"
                        (onChange)="onFilter()" styleClass="w-full text-sm"></p-dropdown>
          </div>
        </div>
      </div>

      <!-- Skeleton -->
      <div *ngIf="loading">
        <div class="ss-card mb-2" *ngFor="let i of [1,2,3,4,5]">
          <p-skeleton height="52px"></p-skeleton>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && filteredOrders.length === 0" class="ss-card text-center py-8">
        <i class="pi pi-shopping-bag text-5xl text-300 mb-3 block"></i>
        <p class="text-500">No orders found</p>
      </div>

      <!-- Orders table -->
      <div *ngIf="!loading && filteredOrders.length > 0" class="ss-card p-0 overflow-hidden">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders">
              <td class="font-mono text-xs font-bold text-blue-700">{{ o.orderNumber }}</td>
              <td class="text-sm">{{ o.customerName }}</td>
              <td class="font-semibold text-sm">₹{{ o.totalAmount | number:'1.0-0' }}</td>
              <td><p-tag [value]="o.paymentMethod" severity="info" styleClass="text-xs"></p-tag></td>
              <td>
                <p-tag [value]="o.status" [severity]="getStatusSeverity(o.status)" styleClass="text-xs"></p-tag>
              </td>
              <td class="text-xs text-500">{{ o.createdAt | date:'dd MMM, hh:mm a' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" styleClass="p-button-text p-button-sm"
                            pTooltip="View" (onClick)="selectedOrder = o; showDetail = true"></p-button>
                  <div *ngIf="canChangeStatus(o.status)" style="min-width:130px">
                    <p-dropdown [options]="getNextStatuses(o.status)"
                                optionLabel="label" optionValue="value"
                                (onChange)="onUpdateStatus(o, $event.value)"
                                placeholder="Update" styleClass="w-full text-xs"></p-dropdown>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail Dialog -->
      <p-dialog [(visible)]="showDetail" [header]="'Order ' + selectedOrder?.orderNumber"
                [modal]="true" [style]="{width:'600px'}">
        <div *ngIf="selectedOrder" class="pt-2">
          <div class="grid mb-4">
            <div class="col-6">
              <p class="text-500 text-xs mb-1">Customer</p>
              <p class="font-medium text-sm m-0">{{ selectedOrder.customerName }}</p>
            </div>
            <div class="col-6">
              <p class="text-500 text-xs mb-1">Payment</p>
              <p class="font-medium text-sm m-0">{{ selectedOrder.paymentMethod }}</p>
            </div>
            <div class="col-12 mt-2" *ngIf="selectedOrder.deliveryAddress">
              <p class="text-500 text-xs mb-1">Delivery Address</p>
              <p class="text-sm m-0">
                {{ selectedOrder.deliveryAddress.addressLine1 }},
                {{ selectedOrder.deliveryAddress.city }},
                {{ selectedOrder.deliveryAddress.state }} —
                {{ selectedOrder.deliveryAddress.pincode }}
              </p>
            </div>
          </div>

          <p class="font-semibold text-900 mb-2">Order Items</p>
          <div *ngFor="let item of selectedOrder.items" class="flex gap-3 mb-3 p-3 border-1 border-200 border-round-lg">
            <img [src]="item.productImageUrl" style="width:60px;height:60px;object-fit:cover;border-radius:8px"
                 onerror="this.src='https://via.placeholder.com/60'"/>
            <div class="flex-1">
              <p class="font-medium text-sm m-0">{{ item.productName }}</p>
              <p class="text-500 text-xs m-0">Qty: {{ item.quantity }} × ₹{{ item.unitPrice | number:'1.0-0' }}</p>
            </div>
            <p class="font-bold m-0">₹{{ item.finalPrice | number:'1.0-0' }}</p>
          </div>

          <div class="flex justify-content-between font-bold text-lg pt-3 border-top-1 border-200">
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
      font-weight: 600; color: #64748B; text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .ss-table td { padding: .75rem 1rem; border-bottom: 1px solid #F1F5F9; font-size: .875rem; }
    .ss-table tr:hover td { background: #F8FAFC; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = true;
  selectedStatus = '';
  searchTerm = '';
  showDetail = false;
  selectedOrder: any = null;

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Placed', value: 'Placed' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getAllOrders(1, 100).subscribe({
      next: orders => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilter() {
    this.filteredOrders = this.orders.filter(o => {
      const statusMatch = !this.selectedStatus || o.status === this.selectedStatus;
      const searchMatch = !this.searchTerm ||
        o.orderNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }

  onUpdateStatus(order: any, status: string) {
    if (!status) return;
    this.cartService.updateOrderStatus(order.id, status).subscribe({
      next: updated => {
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx > -1) this.orders[idx] = { ...this.orders[idx], status: updated.status };
        this.onFilter();
      }
    });
  }

  canChangeStatus(status: string): boolean {
    return ['Placed', 'Confirmed', 'Shipped'].includes(status);
  }

  getNextStatuses(status: string): { label: string; value: string }[] {
    const transitions: Record<string, { label: string; value: string }[]> = {
      Placed: [{ label: 'Confirm Order', value: 'Confirmed' }, { label: 'Cancel', value: 'Cancelled' }],
      Confirmed: [{ label: 'Mark Shipped', value: 'Shipped' }, { label: 'Cancel', value: 'Cancelled' }],
      Shipped: [{ label: 'Mark Delivered', value: 'Delivered' }]
    };
    return transitions[status] || [];
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      Placed: 'info', Confirmed: 'info', Shipped: 'warning',
      Delivered: 'success', Cancelled: 'danger', FraudHold: 'danger'
    };
    return map[status] || 'info';
  }
}
