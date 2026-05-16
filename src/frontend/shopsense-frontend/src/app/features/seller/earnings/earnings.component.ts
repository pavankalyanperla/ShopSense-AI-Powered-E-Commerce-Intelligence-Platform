import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SellerService } from '../../../core/services/seller.service';
import { EarningsDto } from '../../../core/models/seller.models';

@Component({
  selector: 'app-seller-earnings',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, DividerModule],
  template: `
    <div class="ss-page">
      <h1 class="ss-section-title">Earnings & Payouts</h1>

      <!-- Summary Cards -->
      <div class="ss-earnings-grid mb-4">
        <div class="ss-earning-card border-left-4 border-green-500">
          <p class="text-500 text-sm m-0 mb-1">Total Earnings</p>
          <p class="text-3xl font-bold text-green-700 m-0">₹{{ (earnings?.totalEarnings || 0) | number:'1.0-2' }}</p>
          <p class="text-xs text-500 m-0 mt-1">Since joining ShopSense</p>
        </div>
        <div class="ss-earning-card border-left-4 border-orange-400">
          <p class="text-500 text-sm m-0 mb-1">Pending Payout</p>
          <p class="text-3xl font-bold text-orange-600 m-0">₹{{ (earnings?.pendingPayout || 0) | number:'1.0-2' }}</p>
          <p class="text-xs text-500 m-0 mt-1">Processed every Monday</p>
        </div>
        <div class="ss-earning-card border-left-4 border-blue-500">
          <p class="text-500 text-sm m-0 mb-1">This Month</p>
          <p class="text-3xl font-bold text-blue-700 m-0">₹{{ (earnings?.thisMonthEarnings || 0) | number:'1.0-2' }}</p>
          <p class="text-xs text-500 m-0 mt-1">{{ currentMonth }}</p>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Transactions Table -->
      <h2 class="ss-section-title">Transaction History</h2>
      
      <div *ngIf="!earnings?.transactions?.length" class="text-center py-6">
        <i class="pi pi-wallet text-5xl text-300 mb-3 block"></i>
        <p class="text-500">No transactions yet. Start selling to see earnings here!</p>
      </div>

      <div *ngIf="earnings?.transactions?.length" class="ss-card p-0 overflow-hidden">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Gross Amount</th>
              <th>Commission (5%)</th>
              <th>Net Amount</th>
              <th>Period</th>
              <th>Payout Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of earnings!.transactions">
              <td class="font-medium text-sm">{{ t.productName }}</td>
              <td>{{ t.quantity }}</td>
              <td>₹{{ t.grossAmount | number:'1.0-2' }}</td>
              <td class="text-red-500">-₹{{ t.commissionAmount | number:'1.0-2' }}</td>
              <td class="text-green-600 font-bold">₹{{ t.netAmount | number:'1.0-2' }}</td>
              <td class="text-500 text-sm">{{ t.periodMonth }}</td>
              <td>
                <p-tag [value]="t.payoutStatus" 
                       [severity]="t.payoutStatus === 'Paid' ? 'success' : t.payoutStatus === 'Processing' ? 'warning' : 'info'"
                       styleClass="text-xs"></p-tag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .ss-earnings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .ss-earning-card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .ss-table { border-collapse: collapse; }
    .ss-table th {
      background: #F8FAFC; padding: .75rem 1rem; text-align: left; font-size: .75rem;
      font-weight: 600; color: #64748B; text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .ss-table td {
      padding: .75rem 1rem;
      border-bottom: 1px solid #F1F5F9;
      font-size: .875rem;
    }
  `]
})
export class SellerEarningsComponent implements OnInit {
  earnings: EarningsDto | null = null;
  currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.sellerService.getEarnings().subscribe({
      next: e => this.earnings = e
    });
  }
}
