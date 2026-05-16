# Create all remaining Admin components for Day 7
$ErrorActionPreference = "Stop"

Write-Host "Creating Admin Dashboard Component..." -ForegroundColor Cyan

# Admin Dashboard Component
$adminDashboard = @'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '../../../core/services/cart.service';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, SkeletonModule],
  template: `
    <div>
      <!-- Page header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">Admin Dashboard</h1>
          <p class="text-500 text-sm m-0 mt-1">Platform overview — {{ today | date:'EEEE, dd MMMM yyyy' }}</p>
        </div>
        <p-button label="Refresh" icon="pi pi-refresh" styleClass="p-button-outlined p-button-sm" (onClick)="ngOnInit()"></p-button>
      </div>

      <!-- KPI Cards -->
      <div class="ss-kpi-grid mb-4">
        <div *ngFor="let kpi of kpis" class="ss-kpi-card" [style.borderTopColor]="kpi.color">
          <div class="flex justify-content-between align-items-start">
            <div>
              <p class="text-500 text-sm m-0 mb-1">{{ kpi.label }}</p>
              <p class="text-3xl font-bold m-0" [style.color]="kpi.color">{{ kpi.value }}</p>
            </div>
            <div class="ss-kpi-icon" [style.background]="kpi.color + '20'">
              <i [class]="kpi.icon" [style.color]="kpi.color"></i>
            </div>
          </div>
          <p class="text-xs text-500 m-0 mt-2">{{ kpi.sub }}</p>
        </div>
      </div>

      <div class="grid">
        <!-- Recent Orders -->
        <div class="col-12 lg:col-8">
          <div class="ss-card p-0 overflow-hidden">
            <div class="flex justify-content-between align-items-center p-3 border-bottom-1 border-200">
              <h3 class="font-semibold m-0 text-900">Recent Orders</h3>
              <a class="text-sm font-medium" style="color:var(--ss-brand-blue);cursor:pointer" 
                 (click)="router.navigate(['/admin/orders'])">View all →</a>
            </div>
            <table class="ss-table w-full">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of recentOrders">
                  <td class="font-mono text-xs font-bold text-blue-700">{{ o.orderNumber }}</td>
                  <td class="text-sm">{{ o.customerName }}</td>
                  <td class="font-semibold text-sm">₹{{ o.totalAmount | number:'1.0-0' }}</td>
                  <td><p-tag [value]="o.paymentMethod" severity="info" styleClass="text-xs"></p-tag></td>
                  <td><p-tag [value]="o.status" [severity]="getOrderSeverity(o.status)" styleClass="text-xs"></p-tag></td>
                  <td class="text-xs text-500">{{ o.createdAt | date:'dd MMM, hh:mm a' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pending KYC -->
        <div class="col-12 lg:col-4">
          <div class="ss-card p-0 overflow-hidden">
            <div class="flex justify-content-between align-items-center p-3 border-bottom-1 border-200">
              <h3 class="font-semibold m-0 text-900">Pending KYC</h3>
              <a class="text-sm font-medium" style="color:var(--ss-brand-blue);cursor:pointer" 
                 (click)="router.navigate(['/admin/kyc'])">Review all →</a>
            </div>
            <div *ngIf="pendingSellers.length === 0" class="p-4 text-center text-500 text-sm">
              No pending KYC reviews
            </div>
            <div *ngFor="let s of pendingSellers.slice(0,5)" class="flex align-items-center gap-3 p-3 border-bottom-1 border-50">
              <div class="ss-seller-mini-avatar">{{ s.businessName.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm m-0 text-overflow-ellipsis white-space-nowrap overflow-hidden">
                  {{ s.businessName }}
                </p>
                <p class="text-400 text-xs m-0">{{ s.createdAt | date:'dd MMM yyyy' }}</p>
              </div>
              <div class="flex gap-1">
                <p-button icon="pi pi-check" styleClass="p-button-text p-button-sm p-button-success" 
                          pTooltip="Approve" (onClick)="onApprove(s)"></p-button>
                <p-button icon="pi pi-times" styleClass="p-button-text p-button-sm p-button-danger" 
                          pTooltip="Reject" (onClick)="onReject(s)"></p-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ss-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .ss-kpi-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem;
      border-top: 3px solid;
    }
    .ss-kpi-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .ss-seller-mini-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--ss-brand-blue);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: .875rem;
      flex-shrink: 0;
    }
    .ss-table { border-collapse: collapse; }
    .ss-table th {
      background: #F8FAFC;
      padding: .625rem 1rem;
      text-align: left;
      font-size: .7rem;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .ss-table td {
      padding: .625rem 1rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .ss-table tr:hover td {
      background: #F8FAFC;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  recentOrders: any[] = [];
  pendingSellers: any[] = [];
  today = new Date();
  
  kpis = [
    { label: 'Total Orders', value: '—', icon: 'pi pi-shopping-bag', color: '#3B82F6', sub: 'All time' },
    { label: 'Total Revenue', value: '—', icon: 'pi pi-indian-rupee', color: '#10B981', sub: 'Gross merchandise value' },
    { label: 'Active Sellers', value: '—', icon: 'pi pi-shop', color: '#8B5CF6', sub: 'KYC approved' },
    { label: 'Pending KYC', value: '—', icon: 'pi pi-id-card', color: '#F59E0B', sub: 'Awaiting admin review' }
  ];

  constructor(
    public router: Router,
    private cartService: CartService,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    this.cartService.getAllOrders(1, 10).subscribe({
      next: orders => {
        this.recentOrders = orders.slice(0, 8);
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        this.kpis[0].value = orders.length.toString();
        this.kpis[1].value = '₹' + (revenue / 1000).toFixed(0) + 'K';
      }
    });

    this.sellerService.getAllSellers('Pending').subscribe({
      next: sellers => {
        this.pendingSellers = sellers;
        this.kpis[3].value = sellers.length.toString();
      }
    });

    this.sellerService.getAllSellers('Approved').subscribe({
      next: sellers => {
        this.kpis[2].value = sellers.length.toString();
      }
    });
  }

  onApprove(seller: any) {
    this.sellerService.makeKycDecision(seller.id, true).subscribe({
      next: () => {
        this.pendingSellers = this.pendingSellers.filter(s => s.id !== seller.id);
        this.kpis[3].value = this.pendingSellers.length.toString();
      }
    });
  }

  onReject(seller: any) {
    this.sellerService.makeKycDecision(seller.id, false, 'Documents did not meet requirements').subscribe({
      next: () => {
        this.pendingSellers = this.pendingSellers.filter(s => s.id !== seller.id);
      }
    });
  }

  getOrderSeverity(status: string): string {
    const map: Record<string, string> = {
      Placed: 'info',
      Confirmed: 'info',
      Shipped: 'warning',
      Delivered: 'success',
      Cancelled: 'danger',
      FraudHold: 'danger'
    };
    return map[status] || 'info';
  }
}
'@

$adminDashboard | Out-File -FilePath "src\frontend\shopsense-frontend\src\app\features\admin\dashboard\admin-dashboard.component.ts" -Encoding UTF8

Write-Host "✓ Admin Dashboard created" -ForegroundColor Green
Write-Host "Day 7 Admin components creation script completed!" -ForegroundColor Cyan
Write-Host "Continue creating remaining components manually..." -ForegroundColor Yellow
