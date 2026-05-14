import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { ReviewDto } from '../../../core/models/review.models';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonModule],
  template: `
    <div class="ss-page">
      <h1 class="ss-page-title">My Reviews</h1>
      <p class="ss-page-subtitle">Your product reviews and ratings</p>

      <!-- Loading State -->
      @if (loading) {
        <div class="ss-reviews-list">
          @for (i of [1,2,3]; track i) {
            <div class="ss-review-card">
              <p-skeleton width="200px" height="1.5rem" styleClass="mb-2" />
              <p-skeleton width="150px" height="1rem" styleClass="mb-2" />
              <p-skeleton width="100%" height="4rem" styleClass="mb-2" />
              <p-skeleton width="100px" height="1rem" />
            </div>
          }
        </div>
      }

      <!-- Reviews List -->
      @if (!loading && reviews.length > 0) {
        <div class="ss-reviews-list">
          @for (review of reviews; track review.id) {
            <div class="ss-review-card">
              <div class="ss-review-header">
                <a [routerLink]="['/customer/products', review.productSlug]" class="ss-product-name">
                  {{ review.productName }}
                </a>
                <div class="ss-review-meta">
                  <div class="ss-rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <i [class]="star <= review.rating ? 'pi pi-star-fill' : 'pi pi-star'" class="text-yellow-500"></i>
                    }
                  </div>
                  @if (review.sentimentLabel) {
                    <span [class]="'ss-sentiment ss-sentiment-' + review.sentimentLabel.toLowerCase()">
                      {{ review.sentimentLabel }}
                    </span>
                  }
                </div>
              </div>

              <h4 class="ss-review-title">{{ review.title }}</h4>
              <p class="ss-review-comment">{{ review.comment }}</p>

              <div class="ss-review-footer">
                <span class="ss-review-date">{{ formatDate(review.createdAt) }}</span>
                @if (review.isVerifiedPurchase) {
                  <span class="ss-verified-badge">
                    <i class="pi pi-check-circle"></i>
                    Verified Purchase
                  </span>
                }
              </div>

              @if (review.sellerReply) {
                <div class="ss-seller-reply">
                  <div class="ss-reply-header">
                    <i class="pi pi-reply"></i>
                    <span>Seller Response</span>
                  </div>
                  <p class="ss-reply-text">{{ review.sellerReply }}</p>
                  @if (review.sellerReplyDate) {
                    <span class="ss-reply-date">{{ formatDate(review.sellerReplyDate) }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading && reviews.length === 0) {
        <div class="ss-empty-state">
          <i class="pi pi-star text-6xl text-500 mb-3"></i>
          <h3>No reviews yet</h3>
          <p>Share your experience with products you've purchased</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .ss-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      min-height: calc(100vh - 300px);
    }

    .ss-page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-page-subtitle {
      font-size: 1.125rem;
      color: var(--ss-text-secondary);
      margin-bottom: 2rem;
    }

    .ss-reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .ss-review-card {
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .ss-review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .ss-product-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ss-brand-blue);
      text-decoration: none;
    }

    .ss-product-name:hover {
      text-decoration: underline;
    }

    .ss-review-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .ss-rating {
      display: flex;
      gap: 0.25rem;
    }

    .ss-sentiment {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .ss-sentiment-positive {
      background: #D1FAE5;
      color: #059669;
    }

    .ss-sentiment-negative {
      background: #FEE2E2;
      color: #DC2626;
    }

    .ss-sentiment-neutral {
      background: #FED7AA;
      color: #EA580C;
    }

    .ss-review-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-review-comment {
      font-size: 0.9375rem;
      color: var(--ss-text-secondary);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .ss-review-footer {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .ss-review-date {
      font-size: 0.875rem;
      color: var(--ss-text-secondary);
    }

    .ss-verified-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: #059669;
      font-weight: 600;
    }

    .ss-seller-reply {
      margin-top: 1rem;
      padding: 1rem;
      background: #EFF6FF;
      border-left: 3px solid var(--ss-brand-blue);
      border-radius: 8px;
    }

    .ss-reply-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--ss-brand-blue);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .ss-reply-text {
      font-size: 0.9375rem;
      color: var(--ss-text-primary);
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .ss-reply-date {
      font-size: 0.8125rem;
      color: var(--ss-text-secondary);
    }

    .ss-empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .ss-empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ss-text-primary);
      margin-bottom: 0.5rem;
    }

    .ss-empty-state p {
      font-size: 1rem;
      color: var(--ss-text-secondary);
    }
  `]
})
export class MyReviewsComponent implements OnInit {
  reviews: ReviewDto[] = [];
  loading = true;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getMyReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
