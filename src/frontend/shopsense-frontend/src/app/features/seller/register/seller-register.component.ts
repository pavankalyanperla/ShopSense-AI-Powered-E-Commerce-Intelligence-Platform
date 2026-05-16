import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule, MessageModule],
  template: `
    <div class="ss-auth-page" style="margin-top:-100px">
      <div class="ss-auth-left hidden lg:flex">
        <div class="ss-auth-brand">
          <div class="ss-auth-logo">
            <span class="ss-auth-logo-icon">S</span>
            <span class="ss-auth-logo-text">ShopSense</span>
          </div>
          <h2 class="ss-auth-tagline">Start Selling to<br/>Millions of Indians</h2>
          <div class="ss-auth-features">
            <div *ngFor="let f of features" class="ss-auth-feature">
              <i [class]="f.icon + ' text-blue-300 mr-2'"></i>
              <span>{{ f.text }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="ss-auth-right">
        <div class="ss-auth-form-wrap">
          <h2 class="text-2xl font-bold text-900 m-0 mb-1">Become a Seller</h2>
          <p class="text-500 text-sm mb-4 m-0">Set up your store in minutes</p>
          
          <div *ngIf="error" class="ss-error-msg mb-3">
            <i class="pi pi-exclamation-circle mr-2"></i>{{ error }}
          </div>
          
          <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-1">
              <label class="text-sm font-medium text-700">Business Name *</label>
              <input pInputText [(ngModel)]="businessName" 
                     placeholder="Your store or business name" class="w-full"/>
            </div>
            
            <div class="flex flex-column gap-1">
              <label class="text-sm font-medium text-700">Phone Number *</label>
              <input pInputText [(ngModel)]="phoneNumber" 
                     placeholder="10-digit mobile number" maxlength="10" class="w-full"/>
            </div>
            
            <div class="bg-blue-50 border-1 border-blue-200 border-round-lg p-3 text-sm text-blue-800">
              <i class="pi pi-info-circle mr-2"></i>
              After registration you will need to complete KYC verification (Aadhaar, PAN, GST, Bank details) to start listing products.
            </div>
            
            <p-button label="Create Seller Account" icon="pi pi-shop" 
                      styleClass="w-full" [loading]="loading" (onClick)="onRegister()"></p-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SellerRegisterComponent {
  businessName = '';
  phoneNumber = '';
  loading = false;
  error = '';
  
  features = [
    { icon: 'pi pi-star', text: 'AI Listing Coach — boost visibility' },
    { icon: 'pi pi-shield', text: 'Fraud protection on all transactions' },
    { icon: 'pi pi-chart-line', text: 'Sales analytics and forecasting' },
    { icon: 'pi pi-wallet', text: 'Weekly payouts directly to your bank' }
  ];

  constructor(
    private sellerService: SellerService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.businessName.trim() || !this.phoneNumber.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }
    
    if (this.phoneNumber.length !== 10) {
      this.error = 'Phone number must be 10 digits';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.sellerService.register({
      businessName: this.businessName,
      phoneNumber: this.phoneNumber
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/seller/kyc']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
