import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { SellerService } from '../../../core/services/seller.service';
import { SellerDto, EarningsDto } from '../../../core/models/seller.models';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, MessageModule, SkeletonModule, DividerModule],
  template: `
    <div class="ss-page">
      <!-- Status Banners -->
      <p-message *ngIf="seller?.status === 'Pending'" severity="warn" styleClass="w-full mb-3"
                 text="⏳ Your KYC is under admin review. You can browse but cannot list products yet."></p-message>
      <p-message *ngIf="seller?.status === 'Rejected'" severity="error" styleClass="w-full mb-3"
                 [text]="'❌ KYC Rejected: ' + (seller?.rejectionReason || 'Please resubmit your documents.')"></p-message>
      <p-message *ngIf="seller?.status === 'Suspended'" severity="error" styleClass="w-full mb-3"
                 [text]="'🚫 Account Suspended: ' + (seller?.suspensionReason || 'Contact support.')"></p-message>

      <!-- Hero Banner -->
      <div class="ss-seller-hero mb-4">
        <div class="flex-1">
          <div class="flex align-items-center gap-3 mb-2">
            <div class="ss-seller-avatar">{{ seller?.businessName?.charAt(0) || 'S' }}</div>
            <div>
              <h2 class="text-2xl font-bold text-white m-0">{{ seller?.businessName || 'Your Store' }}</h2>
              <div class="flex align-items-center gap-2 mt-1">
                <p-tag [value]="seller?.status || 'Loading'" [severity]="getStatusSeverity(seller?.status || '')"></p-tag>
                <span class="text-blue-100 text-sm">Seller since {{ seller?.createdAt | date:'MMM yyyy' }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-3 flex-wrap mt-3">
            <button class="ss-hero-btn-white" [disabled]="seller?.status !== 'Approved'"
                    (click)="router.navigate(['/seller/products/new'])">
              <i class="pi pi-plus mr-2"></i>List New Product
            </button>
            <button class="ss-hero-btn-outline" (click)="router.navigate(['/seller/listing-coach'])">
              <i class="pi pi-star mr-2"></i>AI Listing Coach
            </button>
            <button class="ss-hero-btn-outline" (click)="router.navigate(['/seller/orders'])">
              <i class="pi pi-box mr-2"></i>View Orders
            </button>
          </div>
        </div>
      </div>

      <!-- KYC prompt if not submitted -->
      <div *ngIf="seller && !seller.kycDocument" class="ss-kyc-prompt mb-4">
        <div class="ss-kyc-prompt-icon">
          <i class="pi pi-id-card text-3xl text-orange-500"></i>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-900 m-0 mb-1">Complete KYC to Start Selling</h3>
          <p class="text-600 text-sm m-0">Submit your Aadhaar, PAN, GST and bank details. Verified sellers get priority in search results.</p>
        </div>
        <button class="ss-kyc-btn" (click)="router.navigate(['/seller/kyc'])">Submit KYC →</button>
      </div>

      <!-- Earnings Cards -->
      <div class="ss-earnings-grid mb-4">
        <div class="ss-earning-card">
          <i class="pi pi-indian-rupee text-2xl text-green-500 mb-2 block"></i>
          <p class="text-500 text-sm m-0 mb-1">Total Earnings</p>
          <p class="text-3xl font-bold text-green-700 m-0">₹{{ (earnings?.totalEarnings || 0) | number:'1.0-0' }}</p>
        </div>
        <div class="ss-earning-card">
          <i class="pi pi-clock text-2xl text-orange-500 mb-2 block"></i>
          <p class="text-500 text-sm m-0 mb-1">Pending Payout</p>
          <p class="text-3xl font-bold text-orange-600 m-0">₹{{ (earnings?.pendingPayout || 0) | number:'1.0-0' }}</p>
        </div>
        <div class="ss-earning-card">
          <i class="pi pi-calendar text-2xl text-blue-500 mb-2 block"></i>
          <p class="text-500 text-sm m-0 mb-1">This Month</p>
          <p class="text-3xl font-bold text-blue-700 m-0">₹{{ (earnings?.thisMonthEarnings || 0) | number:'1.0-0' }}</p>
        </div>
        <div class="ss-earning-card">
          <i class="pi pi-box text-2xl text-purple-500 mb-2 block"></i>
          <p class="text-500 text-sm m-0 mb-1">Total Orders</p>
          <p class="text-3xl font-bold text-purple-700 m-0">{{ earnings?.transactions?.length || 0 }}</p>
        </div>
      </div>

      <!-- Quick Action Grid -->
      <h2 class="ss-section-title">Quick Actions</h2>
      <div class="ss-quick-actions-grid mb-4">
        <div *ngFor="let action of quickActions" class="ss-quick-card"
             [class.disabled]="action.requiresApproval && seller?.status !== 'Approved'"
             (click)="onQuickAction(action)">
          <i [class]="action.icon + ' text-3xl mb-2 block'" [style.color]="action.color"></i>
          <p class="font-semibold text-sm text-900 m-0 mb-1">{{ action.label }}</p>
          <p class="text-xs text-500 m-0">{{ action.desc }}</p>
          <span *ngIf="action.requiresApproval && seller?.status !== 'Approved'" class="ss-locked-badge">🔒 KYC Required</span>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div *ngIf="earnings?.transactions?.length">
        <h2 class="ss-section-title">Recent Transactions</h2>
        <div class="ss-card p-0 overflow-hidden">
          <table class="w-full ss-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Gross</th>
                <th>Commission</th>
                <th>Net</th>
                <th>Status</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of earnings!.transactions.slice(0,5)">
                <td>{{ t.productName }}</td>
                <td>{{ t.quantity }}</td>
                <td>₹{{ t.grossAmount | number:'1.0-0' }}</td>
                <td class="text-red-500">-₹{{ t.commissionAmount | number:'1.0-0' }}</td>
                <td class="text-green-600 font-semibold">₹{{ t.netAmount | number:'1.0-0' }}</td>
                <td>
                  <p-tag [value]="t.payoutStatus" 
                         [severity]="t.payoutStatus === 'Paid' ? 'success' : 'warning'"
                         styleClass="text-xs"></p-tag>
                </td>
                <td class="text-500 text-sm">{{ t.periodMonth }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ss-seller-hero {
      background: linear-gradient(135deg, #1E6B3E, #1D9E75);
      border-radius: 16px;
      padding: 2rem 2.5rem;
      display: flex;
      gap: 2rem;
    }
    .ss-seller-avatar {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .ss-hero-btn-white {
      padding: .5rem 1.25rem;
      background: #fff;
      color: #1E6B3E;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: .875rem;
    }
    .ss-hero-btn-white:disabled {
      opacity: .5;
      cursor: not-allowed;
    }
    .ss-hero-btn-outline {
      padding: .5rem 1.25rem;
      background: rgba(255,255,255,.15);
      color: #fff;
      border: 1.5px solid rgba(255,255,255,.4);
      border-radius: 8px;
      cursor: pointer;
      font-size: .875rem;
    }
    .ss-kyc-prompt {
      border: 2px dashed #FCD34D;
      border-radius: 12px;
      background: #FFFBEB;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .ss-kyc-prompt-icon {
      width: 56px;
      height: 56px;
      background: #FEF3C7;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ss-kyc-btn {
      padding: .625rem 1.5rem;
      background: #F59E0B;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
    }
    .ss-earnings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .ss-earning-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }
    .ss-quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
    .ss-quick-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
      cursor: pointer;
      transition: all .2s;
      position: relative;
    }
    .ss-quick-card:hover {
      border-color: #2E75B6;
      box-shadow: 0 4px 12px rgba(46,117,182,.15);
      transform: translateY(-2px);
    }
    .ss-quick-card.disabled {
      opacity: .6;
      cursor: not-allowed;
    }
    .ss-quick-card.disabled:hover {
      transform: none;
      box-shadow: none;
    }
    .ss-locked-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: .65rem;
      background: #FEF3C7;
      color: #92400E;
      padding: .1rem .4rem;
      border-radius: 10px;
    }
    .ss-table {
      border-collapse: collapse;
      width: 100%;
    }
    .ss-table th {
      background: #F8FAFC;
      padding: .75rem 1rem;
      text-align: left;
      font-size: .75rem;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: .05em;
      border-bottom: 1px solid #E2E8F0;
    }
    .ss-table td {
      padding: .75rem 1rem;
      font-size: .875rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .ss-table tr:last-child td {
      border-bottom: none;
    }
    .ss-table tr:hover td {
      background: #F8FAFC;
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  seller: SellerDto | null = null;
  earnings: EarningsDto | null = null;
  
  quickActions = [
    { label: 'My Products', icon: 'pi pi-box', color: '#3B82F6', desc: 'Manage your listings', route: '/seller/products', requiresApproval: true },
    { label: 'Orders', icon: 'pi pi-shopping-bag', color: '#10B981', desc: 'View & fulfill orders', route: '/seller/orders', requiresApproval: true },
    { label: 'KYC Status', icon: 'pi pi-id-card', color: '#F59E0B', desc: 'Verification status', route: '/seller/kyc', requiresApproval: false },
    { label: 'AI Coach', icon: 'pi pi-star', color: '#8B5CF6', desc: 'Optimise listings', route: '/seller/listing-coach', requiresApproval: false },
    { label: 'Earnings', icon: 'pi pi-wallet', color: '#059669', desc: 'Payouts & transactions', route: '/seller/earnings', requiresApproval: false },
    { label: 'Analytics', icon: 'pi pi-chart-bar', color: '#6366F1', desc: 'Sales performance', route: '/seller/analytics', requiresApproval: true }
  ];

  constructor(
    public router: Router,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    this.sellerService.getMe().subscribe({
      next: s => this.seller = s,
      error: () => {}
    });
    
    this.sellerService.getEarnings().subscribe({
      next: e => this.earnings = e,
      error: () => {}
    });
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      Approved: 'success',
      Pending: 'warning',
      Rejected: 'danger',
      Suspended: 'danger'
    };
    return map[status] || 'info';
  }

  onQuickAction(action: any) {
    if (action.requiresApproval && this.seller?.status !== 'Approved') return;
    this.router.navigate([action.route]);
  }
}
