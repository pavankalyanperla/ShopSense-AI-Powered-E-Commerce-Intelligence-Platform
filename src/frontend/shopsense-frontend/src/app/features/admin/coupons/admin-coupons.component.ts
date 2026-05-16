import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '../../../core/services/cart.service';
import { Coupon } from '../../../core/models/order.models';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, DialogModule,
            InputTextModule, InputNumberModule, DropdownModule, CalendarModule,
            ToggleButtonModule, SkeletonModule],
  template: `
    <div>
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">Coupon Management</h1>
          <p class="text-500 text-sm m-0 mt-1">{{ coupons.length }} coupons total</p>
        </div>
        <p-button label="Create Coupon" icon="pi pi-plus" (onClick)="openCreateDialog()"></p-button>
      </div>

      <!-- Skeleton -->
      <div *ngIf="loading">
        <p-skeleton height="60px" styleClass="mb-2" *ngFor="let i of [1,2,3]"></p-skeleton>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && coupons.length === 0" class="ss-card text-center py-8">
        <i class="pi pi-tag text-5xl text-300 mb-3 block"></i>
        <h3 class="text-xl font-medium text-700 mb-2">No coupons yet</h3>
        <p class="text-500 mb-4">Create your first coupon to offer discounts to customers</p>
        <p-button label="Create First Coupon" icon="pi pi-plus" (onClick)="openCreateDialog()"></p-button>
      </div>

      <!-- Coupons table -->
      <div *ngIf="!loading && coupons.length > 0" class="ss-card p-0 overflow-hidden">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Max Uses</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of coupons">
              <td>
                <span class="font-mono font-bold text-blue-700 text-sm"
                      style="background:#EFF6FF;padding:.2rem .5rem;border-radius:6px">
                  {{ c.code }}
                </span>
              </td>
              <td class="text-sm text-600">{{ c.discountType }}</td>
              <td class="font-bold text-sm">
                {{ c.discountType === 'Percentage' ? c.discountValue + '%' : '₹' + c.discountValue }}
              </td>
              <td class="text-sm">₹{{ c.minOrderValue | number:'1.0-0' }}</td>
              <td class="text-sm">
                {{ c.usedCount }}/{{ c.usageLimit || '∞' }}
              </td>
              <td class="text-sm text-500">{{ c.expiresAt | date:'dd MMM yyyy' }}</td>
              <td>
                <p-tag [value]="isExpired(c) ? 'Expired' : c.isActive ? 'Active' : 'Inactive'"
                       [severity]="isExpired(c) ? 'danger' : c.isActive ? 'success' : 'warn'"
                       styleClass="text-xs"></p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-pencil" styleClass="p-button-text p-button-sm"
                            pTooltip="Edit" (onClick)="onEdit(c)"></p-button>
                  <p-button icon="pi pi-trash" styleClass="p-button-text p-button-sm p-button-danger"
                            pTooltip="Delete" (onClick)="onDelete(c)"></p-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Dialog -->
      <p-dialog [(visible)]="showDialog" [header]="editingCoupon ? 'Edit Coupon' : 'Create Coupon'"
                [modal]="true" [style]="{width:'500px'}" [draggable]="false">
        <div class="flex flex-column gap-3 pt-2">
          <div class="grid">
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Coupon Code *</label>
              <input pInputText [(ngModel)]="form.code" placeholder="e.g. SAVE20"
                     (input)="form.code = form.code.toUpperCase()"/>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Discount Type *</label>
              <p-dropdown [options]="discountTypes" [(ngModel)]="form.discountType"
                          optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">
                Discount Value * {{ form.discountType === 'Percentage' ? '(%)' : '(₹)' }}
              </label>
              <p-inputNumber [(ngModel)]="form.discountValue" [min]="0"
                             [max]="form.discountType === 'Percentage' ? 100 : 100000"
                             styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Minimum Order (₹)</label>
              <p-inputNumber [(ngModel)]="form.minimumOrderAmount" prefix="₹" [min]="0"
                             styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Maximum Uses</label>
              <p-inputNumber [(ngModel)]="form.maxUses" [min]="1" placeholder="Leave blank for unlimited"
                             styleClass="w-full"></p-inputNumber>
            </div>
            <div class="col-6 flex flex-column gap-1">
              <label class="text-sm font-medium">Expiry Date *</label>
              <p-calendar [(ngModel)]="form.expiryDate" dateFormat="dd/mm/yy"
                          [minDate]="today" styleClass="w-full"></p-calendar>
            </div>
            <div class="col-12 flex flex-column gap-1">
              <label class="text-sm font-medium">Description</label>
              <input pInputText [(ngModel)]="form.description" placeholder="Optional description for this coupon"/>
            </div>
            <div class="col-12 flex align-items-center gap-2 mt-1">
              <p-toggleButton [(ngModel)]="form.isActive" onLabel="Active" offLabel="Inactive"
                              onIcon="pi pi-check" offIcon="pi pi-times"></p-toggleButton>
            </div>
          </div>
          <div *ngIf="formError" class="ss-error-msg text-sm">{{ formError }}</div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancel" styleClass="p-button-text" (onClick)="showDialog = false"></p-button>
          <p-button [label]="editingCoupon ? 'Save Changes' : 'Create Coupon'"
                    [loading]="saving" (onClick)="onSave()"></p-button>
        </ng-template>
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
    .ss-table td { padding: .75rem 1rem; border-bottom: 1px solid #F1F5F9; }
    .ss-table tr:hover td { background: #F8FAFC; }
  `]
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = true;
  showDialog = false;
  editingCoupon: Coupon | null = null;
  saving = false;
  formError = '';
  today = new Date();

  form = {
    code: '',
    discountType: 'Percentage',
    discountValue: 10,
    minimumOrderAmount: 0,
    maxUses: null as number | null,
    expiryDate: null as Date | null,
    description: '',
    isActive: true
  };

  discountTypes = [
    { label: 'Percentage (%)', value: 'Percentage' },
    { label: 'Flat Amount (₹)', value: 'Flat' }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getActiveCoupons().subscribe({
      next: c => { this.coupons = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateDialog() {
    this.editingCoupon = null;
    this.form = {
      code: '', discountType: 'Percentage', discountValue: 10,
      minimumOrderAmount: 0, maxUses: null, expiryDate: null,
      description: '', isActive: true
    };
    this.formError = '';
    this.showDialog = true;
  }

  onEdit(coupon: Coupon) {
    this.editingCoupon = coupon;
    this.form = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minOrderValue || 0,
      maxUses: coupon.usageLimit || null,
      expiryDate: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
      description: coupon.description || '',
      isActive: coupon.isActive
    };
    this.formError = '';
    this.showDialog = true;
  }

  onSave() {
    if (!this.form.code || !this.form.discountValue || !this.form.expiryDate) {
      this.formError = 'Please fill in all required fields';
      return;
    }
    this.saving = true;
    this.formError = '';

    const payload = {
      code: this.form.code,
      discountType: this.form.discountType,
      discountValue: this.form.discountValue,
      minimumOrderAmount: this.form.minimumOrderAmount,
      maxUses: this.form.maxUses,
      expiryDate: this.form.expiryDate?.toISOString(),
      description: this.form.description,
      isActive: this.form.isActive
    };

    const req = this.editingCoupon
      ? this.cartService.updateCoupon(this.editingCoupon.id, payload)
      : this.cartService.createCoupon(payload);

    req.subscribe({
      next: saved => {
        this.saving = false;
        this.showDialog = false;
        if (this.editingCoupon) {
          const idx = this.coupons.findIndex(c => c.id === this.editingCoupon!.id);
          if (idx > -1) this.coupons[idx] = saved;
        } else {
          this.coupons.unshift(saved);
        }
      },
      error: err => {
        this.saving = false;
        this.formError = err.error?.message || 'Failed to save coupon';
      }
    });
  }

  onDelete(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    this.cartService.deleteCoupon(coupon.id).subscribe({
      next: () => { this.coupons = this.coupons.filter(c => c.id !== coupon.id); }
    });
  }

  isExpired(c: Coupon): boolean {
    return c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
  }
}
