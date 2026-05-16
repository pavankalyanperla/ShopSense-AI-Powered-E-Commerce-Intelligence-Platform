import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, SkeletonModule, TooltipModule],
  template: `
    <div>
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">Notification Log</h1>
          <p class="text-500 text-sm m-0 mt-1">{{ notifications.length }} notifications</p>
        </div>
        <div class="flex gap-2">
          <p-button label="Retry Failed" icon="pi pi-refresh" styleClass="p-button-warning p-button-sm"
                    [loading]="retrying" (onClick)="onRetryFailed()"></p-button>
          <p-button label="Refresh" icon="pi pi-sync" styleClass="p-button-text p-button-sm"
                    (onClick)="loadNotifications()"></p-button>
        </div>
      </div>

      <!-- Skeleton -->
      <div *ngIf="loading" class="ss-card">
        <p-skeleton height="40px" styleClass="mb-2" *ngFor="let i of [1,2,3,4,5]"></p-skeleton>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && notifications.length === 0" class="ss-card text-center py-8">
        <i class="pi pi-bell text-5xl text-300 mb-3 block"></i>
        <p class="text-500">No notifications sent yet. Place an order to trigger notifications.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && notifications.length > 0" class="ss-card p-0 overflow-hidden">
        <table class="ss-table w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Sent At</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let n of notifications">
              <td>
                <span class="font-medium text-sm text-blue-700">{{ formatType(n.type) }}</span>
              </td>
              <td class="text-sm">
                <div>{{ n.recipientName }}</div>
                <div class="text-400 text-xs">{{ n.recipientEmail }}</div>
              </td>
              <td class="text-sm" style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                {{ n.subject }}
              </td>
              <td>
                <p-tag [value]="n.status" [severity]="getStatusSeverity(n.status)" styleClass="text-xs"></p-tag>
              </td>
              <td class="text-center text-sm">{{ n.retryCount }}</td>
              <td class="text-xs text-500">
                {{ n.sentAt ? (n.sentAt | date:'dd MMM, hh:mm a') : '—' }}
              </td>
              <td class="text-xs text-500">
                {{ n.createdAt | date:'dd MMM, hh:mm a' }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Load more -->
        <div class="p-3 text-center" *ngIf="notifications.length >= pageSize">
          <p-button label="Load More" styleClass="p-button-text p-button-sm"
                    [loading]="loadingMore" (onClick)="loadMore()"></p-button>
        </div>
      </div>
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
export class AdminNotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;
  retrying = false;
  loadingMore = false;
  page = 1;
  pageSize = 20;
  private apiUrl = `${environment.apiGatewayUrl}/api/v1/notifications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() { this.loadNotifications(); }

  loadNotifications() {
    this.loading = true;
    this.page = 1;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${this.apiUrl}?page=1&pageSize=${this.pageSize}`, { headers }).subscribe({
      next: data => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.page++;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${this.apiUrl}?page=${this.page}&pageSize=${this.pageSize}`, { headers }).subscribe({
      next: data => { this.notifications.push(...data); this.loadingMore = false; },
      error: () => { this.loadingMore = false; }
    });
  }

  onRetryFailed() {
    this.retrying = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${this.apiUrl}/retry-failed`, {}, { headers }).subscribe({
      next: () => { this.retrying = false; this.loadNotifications(); },
      error: () => { this.retrying = false; }
    });
  }

  formatType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      Sent: 'success', Pending: 'warning', Failed: 'danger', Retrying: 'info'
    };
    return map[status] || 'info';
  }
}
