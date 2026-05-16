import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SellerService } from '../../../core/services/seller.service';
import { SellerDto } from '../../../core/models/seller.models';

@Component({
  selector: 'app-admin-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, DialogModule,
            InputTextModule, DropdownModule, SkeletonModule, MessageModule],
  template: `
    <div>
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">KYC Review</h1>
          <p class="text-500 text-sm m-0 mt-1">{{ filteredSellers.length }} sellers awaiting verification</p>
        </div>
        <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus"
                    optionLabel="label" optionValue="value"
                    (onChange)="onFilter()" styleClass="text-sm"></p-dropdown>
      </div>

      <!-- Skeleton -->
      <div *ngIf="loading">
        <div class="ss-card mb-3" *ngFor="let i of [1,2,3]">
          <p-skeleton height="80px"></p-skeleton>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && filteredSellers.length === 0" class="ss-card text-center py-8">
        <i class="pi pi-check-circle text-5xl text-green-400 mb-3 block"></i>
        <h3 class="text-xl font-medium text-700 mb-2">All caught up!</h3>
        <p class="text-500">No sellers with status "{{ selectedStatus || 'Pending' }}" at the moment.</p>
      </div>

      <!-- Seller Cards -->
      <div *ngFor="let s of filteredSellers" class="ss-kyc-card mb-3">
        <div class="flex align-items-start gap-3 mb-3">
          <div class="ss-seller-avatar">{{ s.businessName.charAt(0) }}</div>
          <div class="flex-1">
            <div class="flex align-items-center gap-2 flex-wrap">
              <h3 class="font-bold text-900 m-0">{{ s.businessName }}</h3>
              <p-tag [value]="s.status" [severity]="getStatusSeverity(s.status)" styleClass="text-xs"></p-tag>
            </div>
            <p class="text-500 text-sm m-0">Registered: {{ s.createdAt | date:'dd MMM yyyy' }}</p>
          </div>
          <div class="flex gap-2">
            <p-button label="Approve" icon="pi pi-check" styleClass="p-button-success p-button-sm"
                      *ngIf="s.status === 'Pending'"
                      (onClick)="openApprove(s)"></p-button>
            <p-button label="Reject" icon="pi pi-times" styleClass="p-button-danger p-button-outlined p-button-sm"
                      *ngIf="s.status === 'Pending'"
                      (onClick)="openReject(s)"></p-button>
            <p-button label="Suspend" icon="pi pi-ban" styleClass="p-button-warning p-button-outlined p-button-sm"
                      *ngIf="s.status === 'Approved'"
                      (onClick)="openSuspend(s)"></p-button>
            <p-button icon="pi pi-eye" pTooltip="View details"
                      styleClass="p-button-text p-button-sm"
                      (onClick)="selectedSeller = s; showDetail = true"></p-button>
          </div>
        </div>

        <!-- KYC Document status row -->
        <div *ngIf="s.kycDocument" class="flex gap-2 flex-wrap">
          <div class="ss-doc-chip" [class]="getChipClass(s.kycDocument.aadhaarStatus)">
            <i class="pi pi-id-card mr-1"></i>Aadhaar: {{ s.kycDocument.aadhaarStatus }}
          </div>
          <div class="ss-doc-chip" [class]="getChipClass(s.kycDocument.panStatus)">
            <i class="pi pi-credit-card mr-1"></i>PAN: {{ s.kycDocument.panStatus }}
          </div>
          <div class="ss-doc-chip" [class]="getChipClass(s.kycDocument.gstStatus)">
            <i class="pi pi-building mr-1"></i>GST: {{ s.kycDocument.gstStatus }}
          </div>
          <div class="ss-doc-chip" [class]="getChipClass(s.kycDocument.bankStatus)">
            <i class="pi pi-wallet mr-1"></i>Bank: {{ s.kycDocument.bankStatus }}
          </div>
        </div>
        <div *ngIf="!s.kycDocument">
          <p-message severity="warn" text="KYC documents not yet submitted by seller" styleClass="text-xs"></p-message>
        </div>
      </div>

      <!-- Seller Detail Dialog -->
      <p-dialog [(visible)]="showDetail" header="Seller Details" [modal]="true" [style]="{width:'520px'}">
        <div *ngIf="selectedSeller" class="pt-2">
          <div class="flex align-items-center gap-3 mb-4">
            <div class="ss-seller-avatar">{{ selectedSeller.businessName.charAt(0) }}</div>
            <div>
              <h3 class="font-bold text-900 m-0">{{ selectedSeller.businessName }}</h3>
              <p-tag [value]="selectedSeller.status" [severity]="getStatusSeverity(selectedSeller.status)"></p-tag>
            </div>
          </div>
          <div class="grid">
            <div class="col-6">
              <p class="text-500 text-xs mb-1">Email</p>
              <p class="font-medium text-sm m-0">{{ selectedSeller.email }}</p>
            </div>
            <div class="col-6">
              <p class="text-500 text-xs mb-1">Phone</p>
              <p class="font-medium text-sm m-0">{{ selectedSeller.phoneNumber }}</p>
            </div>
            <div class="col-6 mt-3">
              <p class="text-500 text-xs mb-1">Joined</p>
              <p class="font-medium text-sm m-0">{{ selectedSeller.createdAt | date:'dd MMM yyyy' }}</p>
            </div>
            <div class="col-6 mt-3">
              <p class="text-500 text-xs mb-1">Total Earnings</p>
              <p class="font-medium text-sm m-0">₹{{ selectedSeller.totalEarnings | number:'1.0-0' }}</p>
            </div>
          </div>
          <div *ngIf="selectedSeller.kycDocument" class="mt-4">
            <p class="font-semibold text-900 mb-2">KYC Documents</p>
            <div class="grid text-sm">
              <div class="col-6"><span class="text-500">Aadhaar:</span> {{ selectedSeller.kycDocument.aadhaarNumber }}</div>
              <div class="col-6"><span class="text-500">PAN:</span> {{ selectedSeller.kycDocument.panNumber }}</div>
              <div class="col-6 mt-2"><span class="text-500">GST:</span> {{ selectedSeller.kycDocument.gstNumber }}</div>
              <div class="col-6 mt-2"><span class="text-500">IFSC:</span> {{ selectedSeller.kycDocument.ifscCode }}</div>
              <div class="col-12 mt-2"><span class="text-500">Bank A/C:</span> {{ selectedSeller.kycDocument.bankAccountNumber }}</div>
            </div>
          </div>
        </div>
      </p-dialog>

      <!-- Reject Dialog -->
      <p-dialog [(visible)]="showRejectDialog" header="Reject KYC" [modal]="true" [style]="{width:'400px'}">
        <div class="pt-2 flex flex-column gap-3">
          <p class="text-700 text-sm m-0">Please provide a reason for rejecting <strong>{{ actionSeller?.businessName }}</strong>'s KYC.</p>
          <div class="flex flex-column gap-1">
            <label class="text-sm font-medium">Rejection Reason *</label>
            <input pInputText [(ngModel)]="actionReason" placeholder="e.g. Invalid Aadhaar number provided"/>
          </div>
          <div *ngIf="actionError" class="ss-error-msg text-sm">{{ actionError }}</div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" styleClass="p-button-text" (onClick)="showRejectDialog = false"></p-button>
          <p-button label="Confirm Rejection" styleClass="p-button-danger" [loading]="actioning"
                    (onClick)="confirmReject()"></p-button>
        </ng-template>
      </p-dialog>

      <!-- Suspend Dialog -->
      <p-dialog [(visible)]="showSuspendDialog" header="Suspend Seller" [modal]="true" [style]="{width:'400px'}">
        <div class="pt-2 flex flex-column gap-3">
          <p class="text-700 text-sm m-0">Provide a reason for suspending <strong>{{ actionSeller?.businessName }}</strong>.</p>
          <div class="flex flex-column gap-1">
            <label class="text-sm font-medium">Suspension Reason *</label>
            <input pInputText [(ngModel)]="actionReason" placeholder="e.g. Policy violation reported"/>
          </div>
          <div *ngIf="actionError" class="ss-error-msg text-sm">{{ actionError }}</div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" styleClass="p-button-text" (onClick)="showSuspendDialog = false"></p-button>
          <p-button label="Suspend Seller" styleClass="p-button-warning" [loading]="actioning"
                    (onClick)="confirmSuspend()"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .ss-kyc-card {
      background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem;
    }
    .ss-seller-avatar {
      width: 48px; height: 48px; border-radius: 12px; background: var(--ss-brand-blue);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.25rem; flex-shrink: 0;
    }
    .ss-doc-chip {
      padding: .25rem .75rem; border-radius: 20px; font-size: .75rem; font-weight: 500;
    }
    .chip-approved { background: #ECFDF5; color: #065F46; border: 1px solid #6EE7B7; }
    .chip-pending { background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
    .chip-rejected { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
  `]
})
export class AdminKycComponent implements OnInit {
  sellers: SellerDto[] = [];
  filteredSellers: SellerDto[] = [];
  loading = true;
  selectedStatus = 'Pending';
  selectedSeller: SellerDto | null = null;
  showDetail = false;
  showRejectDialog = false;
  showSuspendDialog = false;
  actionSeller: SellerDto | null = null;
  actionReason = '';
  actionError = '';
  actioning = false;

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Suspended', value: 'Suspended' }
  ];

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadSellers();
  }

  loadSellers() {
    this.loading = true;
    this.sellerService.getAllSellers(this.selectedStatus).subscribe({
      next: s => {
        this.sellers = s;
        this.filteredSellers = s;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilter() {
    this.loadSellers();
  }

  openApprove(seller: SellerDto) {
    this.sellerService.makeKycDecision(seller.id, true).subscribe({
      next: updated => {
        this.sellers = this.sellers.filter(s => s.id !== seller.id);
        this.filteredSellers = this.filteredSellers.filter(s => s.id !== seller.id);
      }
    });
  }

  openReject(seller: SellerDto) {
    this.actionSeller = seller;
    this.actionReason = '';
    this.actionError = '';
    this.showRejectDialog = true;
  }

  confirmReject() {
    if (!this.actionReason.trim()) { this.actionError = 'Please provide a reason'; return; }
    this.actioning = true;
    this.sellerService.makeKycDecision(this.actionSeller!.id, false, this.actionReason).subscribe({
      next: () => {
        this.actioning = false;
        this.showRejectDialog = false;
        this.sellers = this.sellers.filter(s => s.id !== this.actionSeller!.id);
        this.filteredSellers = this.filteredSellers.filter(s => s.id !== this.actionSeller!.id);
      },
      error: () => { this.actioning = false; this.actionError = 'Action failed. Try again.'; }
    });
  }

  openSuspend(seller: SellerDto) {
    this.actionSeller = seller;
    this.actionReason = '';
    this.actionError = '';
    this.showSuspendDialog = true;
  }

  confirmSuspend() {
    if (!this.actionReason.trim()) { this.actionError = 'Please provide a reason'; return; }
    this.actioning = true;
    this.sellerService.suspendSeller(this.actionSeller!.id, this.actionReason).subscribe({
      next: () => {
        this.actioning = false;
        this.showSuspendDialog = false;
        this.filteredSellers = this.filteredSellers.filter(s => s.id !== this.actionSeller!.id);
      },
      error: () => { this.actioning = false; this.actionError = 'Action failed. Try again.'; }
    });
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      Approved: 'success', Pending: 'warning', Rejected: 'danger', Suspended: 'danger'
    };
    return map[status] || 'info';
  }

  getChipClass(status: string): string {
    const map: Record<string, string> = {
      Approved: 'ss-doc-chip chip-approved',
      Pending: 'ss-doc-chip chip-pending',
      Rejected: 'ss-doc-chip chip-rejected'
    };
    return map[status] || 'ss-doc-chip chip-pending';
  }
}
