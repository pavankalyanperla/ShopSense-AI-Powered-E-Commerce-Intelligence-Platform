import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { SellerService } from '../../../core/services/seller.service';
import { SellerDto, KycDocumentDto } from '../../../core/models/seller.models';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TagModule, DividerModule, MessageModule],
  template: `
    <div class="ss-page" style="max-width:720px;margin:0 auto">
      <div class="flex align-items-center gap-3 mb-4">
        <button class="ss-back-btn" (click)="router.navigate(['/seller/dashboard'])">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">KYC Verification</h1>
          <p class="text-500 text-sm m-0 mt-1">Submit your documents to start selling on ShopSense</p>
        </div>
      </div>

      <!-- Already submitted -->
      <div *ngIf="kyc" class="mb-4">
        <p-message severity="info" styleClass="w-full mb-3"
                   text="Your KYC has already been submitted. Current status shown below."></p-message>

        <div class="ss-card">
          <h3 class="font-semibold text-900 mb-3 mt-0">KYC Status</h3>
          <div class="grid">
            <div class="col-6 flex flex-column gap-1 mb-3">
              <span class="text-500 text-xs">Aadhaar Status</span>
              <p-tag [value]="kyc.aadhaarStatus" [severity]="getDocSeverity(kyc.aadhaarStatus)"></p-tag>
            </div>
            <div class="col-6 flex flex-column gap-1 mb-3">
              <span class="text-500 text-xs">PAN Status</span>
              <p-tag [value]="kyc.panStatus" [severity]="getDocSeverity(kyc.panStatus)"></p-tag>
            </div>
            <div class="col-6 flex flex-column gap-1 mb-3">
              <span class="text-500 text-xs">GST Status</span>
              <p-tag [value]="kyc.gstStatus" [severity]="getDocSeverity(kyc.gstStatus)"></p-tag>
            </div>
            <div class="col-6 flex flex-column gap-1 mb-3">
              <span class="text-500 text-xs">Bank Status</span>
              <p-tag [value]="kyc.bankStatus" [severity]="getDocSeverity(kyc.bankStatus)"></p-tag>
            </div>
          </div>
          <p class="text-500 text-xs m-0">Submitted: {{ kyc.submittedAt | date:'dd MMM yyyy, hh:mm a' }}</p>
        </div>
      </div>

      <!-- Form -->
      <div *ngIf="!kyc" class="ss-card">
        <h3 class="font-semibold text-900 mb-1 mt-0">Identity Documents</h3>
        <p class="text-500 text-sm mb-4 mt-0">All fields are required. Documents are verified within 24–48 hours.</p>

        <div *ngIf="error" class="ss-error-msg mb-3">
          <i class="pi pi-exclamation-circle mr-2"></i>{{ error }}
        </div>
        <div *ngIf="success" class="ss-success-msg mb-3">
          <i class="pi pi-check-circle mr-2"></i>{{ success }}
        </div>

        <div class="flex flex-column gap-4">
          <!-- Aadhaar -->
          <div class="ss-doc-section">
            <div class="ss-doc-header">
              <i class="pi pi-id-card text-blue-500"></i>
              <span class="font-semibold text-900">Aadhaar Card</span>
              <span class="text-400 text-xs ml-auto">12-digit number</span>
            </div>
            <input pInputText [(ngModel)]="form.aadhaarNumber"
                   placeholder="1234 5678 9012" maxlength="12"
                   (input)="onAadhaarInput($event)"
                   class="w-full mt-2"/>
            <p class="text-400 text-xs mt-1 mb-0">Format: 12 digits (no spaces)</p>
          </div>

          <p-divider></p-divider>

          <!-- PAN -->
          <div class="ss-doc-section">
            <div class="ss-doc-header">
              <i class="pi pi-credit-card text-green-500"></i>
              <span class="font-semibold text-900">PAN Card</span>
              <span class="text-400 text-xs ml-auto">10-character alphanumeric</span>
            </div>
            <input pInputText [(ngModel)]="form.panNumber"
                   placeholder="ABCDE1234F" maxlength="10"
                   (input)="form.panNumber = form.panNumber.toUpperCase()"
                   class="w-full mt-2"/>
            <p class="text-400 text-xs mt-1 mb-0">Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)</p>
          </div>

          <p-divider></p-divider>

          <!-- GST -->
          <div class="ss-doc-section">
            <div class="ss-doc-header">
              <i class="pi pi-building text-purple-500"></i>
              <span class="font-semibold text-900">GST Number</span>
              <span class="text-400 text-xs ml-auto">15-character GSTIN</span>
            </div>
            <input pInputText [(ngModel)]="form.gstNumber"
                   placeholder="22AAAAA0000A1Z5" maxlength="15"
                   (input)="form.gstNumber = form.gstNumber.toUpperCase()"
                   class="w-full mt-2"/>
            <p class="text-400 text-xs mt-1 mb-0">Format: 15-character GSTIN</p>
          </div>

          <p-divider></p-divider>

          <!-- Bank -->
          <div class="ss-doc-section">
            <div class="ss-doc-header">
              <i class="pi pi-wallet text-orange-500"></i>
              <span class="font-semibold text-900">Bank Account</span>
            </div>
            <div class="grid mt-2">
              <div class="col-7 flex flex-column gap-1">
                <label class="text-sm text-600">Account Number *</label>
                <input pInputText [(ngModel)]="form.bankAccountNumber" placeholder="Account number"/>
              </div>
              <div class="col-5 flex flex-column gap-1">
                <label class="text-sm text-600">IFSC Code *</label>
                <input pInputText [(ngModel)]="form.ifscCode" placeholder="SBIN0001234" maxlength="11"
                       (input)="form.ifscCode = form.ifscCode.toUpperCase()"/>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border-1 border-blue-200 border-round-lg p-3 text-sm text-blue-800">
            <i class="pi pi-shield mr-2"></i>
            Your documents are encrypted and securely stored. ShopSense will never share your personal information with third parties.
          </div>

          <p-button label="Submit KYC Documents" icon="pi pi-upload"
                    styleClass="w-full" [loading]="submitting" (onClick)="onSubmit()"></p-button>
        </div>
      </div>

      <!-- Resubmit after rejection -->
      <div *ngIf="kyc && seller?.status === 'Rejected'" class="mt-4">
        <p-button label="Resubmit Documents" icon="pi pi-refresh"
                  styleClass="w-full p-button-outlined" (onClick)="kyc = null"></p-button>
      </div>
    </div>
  `,
  styles: [`
    .ss-back-btn {
      width: 40px; height: 40px; border: 1px solid #E2E8F0; background: #fff;
      border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .ss-back-btn:hover { background: #F8FAFC; }
    .ss-doc-section { padding: .25rem 0; }
    .ss-doc-header {
      display: flex; align-items: center; gap: .625rem;
    }
    .ss-success-msg {
      background: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 8px;
      padding: .875rem 1rem; color: #065F46; font-size: .875rem;
    }
  `]
})
export class KycComponent implements OnInit {
  seller: SellerDto | null = null;
  kyc: KycDocumentDto | null = null;
  submitting = false;
  error = '';
  success = '';

  form = {
    aadhaarNumber: '',
    panNumber: '',
    gstNumber: '',
    bankAccountNumber: '',
    ifscCode: ''
  };

  constructor(
    public router: Router,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    this.sellerService.getMe().subscribe({
      next: s => {
        this.seller = s;
        if (s.kycDocument) this.kyc = s.kycDocument;
      },
      error: () => this.router.navigate(['/seller/register'])
    });
  }

  onAadhaarInput(e: any) {
    this.form.aadhaarNumber = e.target.value.replace(/\D/g, '');
  }

  onSubmit() {
    this.error = '';
    if (!this.form.aadhaarNumber || !this.form.panNumber || !this.form.gstNumber ||
        !this.form.bankAccountNumber || !this.form.ifscCode) {
      this.error = 'Please fill in all fields';
      return;
    }
    if (this.form.aadhaarNumber.length !== 12) {
      this.error = 'Aadhaar must be exactly 12 digits';
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(this.form.panNumber)) {
      this.error = 'PAN format invalid (e.g. ABCDE1234F)';
      return;
    }

    this.submitting = true;
    this.sellerService.submitKyc(this.form).subscribe({
      next: s => {
        this.submitting = false;
        this.seller = s;
        this.kyc = s.kycDocument || null;
        this.success = 'KYC submitted successfully! Our team will review within 24–48 hours.';
      },
      error: err => {
        this.submitting = false;
        this.error = err.error?.message || 'Submission failed. Please check your documents and try again.';
      }
    });
  }

  getDocSeverity(status: string): string {
    const map: Record<string, string> = {
      Approved: 'success', Rejected: 'danger', Pending: 'warning'
    };
    return map[status] || 'info';
  }
}
