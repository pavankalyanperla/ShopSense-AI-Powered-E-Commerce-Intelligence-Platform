import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { SellerService } from '../../../core/services/seller.service';
import { ProductService } from '../../../core/services/product.service';
import { ListingCoachResponse, ListingCoachRequest } from '../../../core/models/seller.models';
import { CategoryDto } from '../../../core/models/product.models';

@Component({
  selector: 'app-listing-coach',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
            DropdownModule, DividerModule, SkeletonModule, TagModule],
  template: `
    <div class="ss-page">
      <div class="flex align-items-center gap-3 mb-4">
        <button class="ss-back-btn" (click)="router.navigate(['/seller/dashboard'])">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-900 m-0">AI Listing Coach</h1>
          <p class="text-500 text-sm m-0 mt-1">Score your listing 0–100 and get AI-powered improvement tips</p>
        </div>
      </div>

      <div class="grid">
        <!-- Input Form -->
        <div class="col-12 lg:col-5">
          <div class="ss-card">
            <h3 class="font-semibold text-900 mt-0 mb-3">Listing Details</h3>

            <div class="flex flex-column gap-3">
              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-700">Product Name *</label>
                <input pInputText [(ngModel)]="form.productName"
                       placeholder="Include brand, key specs, model (more detail = higher score)"/>
                <p class="text-400 text-xs m-0 mt-1">{{ form.productName.length }} chars — aim for 60+</p>
              </div>

              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-700">Category *</label>
                <p-dropdown [options]="categories" [(ngModel)]="form.categoryId"
                            optionLabel="name" optionValue="id"
                            placeholder="Select category" styleClass="w-full"></p-dropdown>
              </div>

              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-700">Description *</label>
                <textarea pInputText [(ngModel)]="form.description" rows="5"
                          placeholder="Detailed product description. Include features, materials, compatibility, warranty... (min 100 words for best score)"
                          style="resize:vertical;width:100%"></textarea>
                <p class="text-400 text-xs m-0 mt-1">{{ wordCount }} words — aim for 100+</p>
              </div>

              <div class="grid">
                <div class="col-6 flex flex-column gap-1">
                  <label class="text-sm font-medium text-700">Number of Images</label>
                  <p-inputNumber [(ngModel)]="form.imageCount" [min]="0" [max]="15"
                                 styleClass="w-full"></p-inputNumber>
                  <p class="text-400 text-xs m-0 mt-1">Aim for 5+</p>
                </div>
                <div class="col-6 flex flex-column gap-1">
                  <label class="text-sm font-medium text-700">Specifications Count</label>
                  <p-inputNumber [(ngModel)]="form.specificationCount" [min]="0" [max]="30"
                                 styleClass="w-full"></p-inputNumber>
                  <p class="text-400 text-xs m-0 mt-1">Aim for 8+</p>
                </div>
              </div>

              <div class="flex flex-column gap-1">
                <label class="text-sm font-medium text-700">Base Price (₹) *</label>
                <p-inputNumber [(ngModel)]="form.basePrice" prefix="₹" styleClass="w-full"
                               [min]="1"></p-inputNumber>
              </div>

              <p-button label="Analyse My Listing" icon="pi pi-star" styleClass="w-full"
                        [loading]="analysing" (onClick)="onAnalyse()"></p-button>

              <div *ngIf="error" class="ss-error-msg text-sm">
                <i class="pi pi-exclamation-circle mr-2"></i>{{ error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Results Panel -->
        <div class="col-12 lg:col-7">
          <!-- Skeleton while loading -->
          <div *ngIf="analysing">
            <div class="ss-card mb-3">
              <p-skeleton height="120px" styleClass="mb-3"></p-skeleton>
              <p-skeleton width="60%" height="20px" styleClass="mb-2"></p-skeleton>
              <p-skeleton height="8px" styleClass="mb-3"></p-skeleton>
              <p-skeleton height="8px" styleClass="mb-3"></p-skeleton>
              <p-skeleton height="8px"></p-skeleton>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="!analysing && !result" class="ss-card text-center py-8">
            <div class="ss-coach-illustration mb-4">
              <i class="pi pi-star text-5xl" style="color:var(--ss-brand-blue)"></i>
            </div>
            <h3 class="text-xl font-semibold text-700 mb-2">Your Score Awaits</h3>
            <p class="text-500 text-sm m-0">Fill in the form and click Analyse to see how well your listing scores and get actionable improvement tips.</p>

            <p-divider></p-divider>

            <div class="grid text-left mt-3">
              <div *ngFor="let tip of quickTips" class="col-12 flex gap-2 mb-2">
                <i class="pi pi-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                <p class="text-sm text-600 m-0">{{ tip }}</p>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div *ngIf="!analysing && result">
            <!-- Overall score -->
            <div class="ss-score-card mb-3">
              <div class="flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-white text-opacity-80 text-sm m-0 mb-1">Overall Listing Score</p>
                  <div class="flex align-items-end gap-2">
                    <span class="text-white font-bold" style="font-size:3.5rem;line-height:1">
                      {{ result.overallScore }}
                    </span>
                    <span class="text-white text-opacity-70 text-lg mb-2">/100</span>
                  </div>
                </div>
                <div class="ss-score-badge" [class]="getScoreClass(result.overallScore)">
                  {{ getScoreLabel(result.overallScore) }}
                </div>
              </div>
              <!-- Score bar -->
              <div class="ss-score-bar-bg">
                <div class="ss-score-bar-fill" [style.width.%]="result.overallScore"></div>
              </div>
            </div>

            <!-- Sub-scores -->
            <div class="ss-card mb-3">
              <h3 class="font-semibold text-900 mt-0 mb-3">Score Breakdown</h3>
              <div class="flex flex-column gap-3">
                <div *ngFor="let s of subScores" class="ss-sub-score">
                  <div class="flex justify-content-between align-items-center mb-1">
                    <div class="flex align-items-center gap-2">
                      <i [class]="s.icon" [style.color]="s.color"></i>
                      <span class="text-sm font-medium text-800">{{ s.label }}</span>
                    </div>
                    <span class="text-sm font-bold" [style.color]="s.color">{{ s.score }}/{{ s.max }}</span>
                  </div>
                  <div class="ss-mini-bar-bg">
                    <div class="ss-mini-bar-fill" [style.width.%]="(s.score/s.max)*100"
                         [style.background]="s.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Improvements -->
            <div *ngIf="result.improvements?.length" class="ss-card mb-3">
              <h3 class="font-semibold text-900 mt-0 mb-3">
                <i class="pi pi-bolt text-orange-500 mr-2"></i>Improvement Suggestions
              </h3>
              <div class="flex flex-column gap-2">
                <div *ngFor="let tip of result.improvements" class="flex gap-2 align-items-start">
                  <i class="pi pi-arrow-right text-orange-400 mt-1 flex-shrink-0 text-xs"></i>
                  <p class="text-sm text-700 m-0">{{ tip }}</p>
                </div>
              </div>
            </div>

            <!-- SEO Keywords -->
            <div *ngIf="result.seoKeywords?.length" class="ss-card">
              <h3 class="font-semibold text-900 mt-0 mb-3">
                <i class="pi pi-tags text-blue-500 mr-2"></i>Suggested SEO Keywords
              </h3>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let kw of result.seoKeywords" class="ss-keyword-tag">{{ kw }}</span>
              </div>
              <p class="text-400 text-xs mt-3 mb-0">Add these keywords to your product title and description to improve search ranking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ss-back-btn {
      width: 40px; height: 40px; border: 1px solid #E2E8F0; background: #fff;
      border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .ss-back-btn:hover { background: #F8FAFC; }
    .ss-score-card {
      background: linear-gradient(135deg, #1F4E79, #2563EB);
      border-radius: 16px;
      padding: 1.75rem;
    }
    .ss-score-badge {
      padding: .4rem .9rem;
      border-radius: 20px;
      font-size: .8rem;
      font-weight: 700;
      border: 2px solid rgba(255,255,255,.3);
      color: #fff;
    }
    .score-poor { background: rgba(239,68,68,.3); }
    .score-average { background: rgba(245,158,11,.3); }
    .score-good { background: rgba(16,185,129,.3); }
    .score-excellent { background: rgba(99,102,241,.3); }
    .ss-score-bar-bg {
      background: rgba(255,255,255,.2);
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
    }
    .ss-score-bar-fill {
      height: 100%;
      background: #fff;
      border-radius: 4px;
      transition: width .6s ease;
    }
    .ss-sub-score { padding: .25rem 0; }
    .ss-mini-bar-bg {
      background: #F1F5F9;
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }
    .ss-mini-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width .4s ease;
    }
    .ss-keyword-tag {
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      border-radius: 20px;
      padding: .25rem .75rem;
      font-size: .8rem;
      font-weight: 500;
    }
    .ss-coach-illustration {
      width: 80px; height: 80px; background: #EFF6FF; border-radius: 20px;
      display: flex; align-items: center; justify-content: center; margin: 0 auto;
    }
  `]
})
export class ListingCoachComponent implements OnInit {
  categories: CategoryDto[] = [];
  result: ListingCoachResponse | null = null;
  analysing = false;
  error = '';

  form: ListingCoachRequest = {
    productName: '',
    description: '',
    imageCount: 3,
    specificationCount: 5,
    basePrice: 0,
    categoryId: ''
  };

  quickTips = [
    'Use 60+ character titles with brand, model, and key features',
    'Write 100+ word descriptions covering features, specs, and use cases',
    'Upload 5+ high-quality images from multiple angles',
    'Add 8+ technical specifications to build buyer confidence',
    'Price competitively — check similar listings before setting your price'
  ];

  get wordCount(): number {
    return this.form.description.trim().split(/\s+/).filter(w => w).length;
  }

  get subScores() {
    if (!this.result) return [];
    return [
      { label: 'Title Quality', score: this.result.titleScore, max: 25, icon: 'pi pi-pencil', color: '#3B82F6' },
      { label: 'Description', score: this.result.descriptionScore, max: 25, icon: 'pi pi-align-left', color: '#10B981' },
      { label: 'Images', score: this.result.imageScore, max: 20, icon: 'pi pi-image', color: '#8B5CF6' },
      { label: 'Specifications', score: this.result.specificationScore, max: 20, icon: 'pi pi-list', color: '#F59E0B' },
      { label: 'Price & Stock', score: this.result.priceScore, max: 10, icon: 'pi pi-indian-rupee', color: '#EF4444' }
    ];
  }

  constructor(
    public router: Router,
    private sellerService: SellerService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: cats => this.categories = cats
    });
  }

  onAnalyse() {
    if (!this.form.productName || !this.form.categoryId || !this.form.basePrice) {
      this.error = 'Please fill in Product Name, Category, and Price';
      return;
    }
    this.error = '';
    this.analysing = true;
    this.result = null;

    this.sellerService.getListingCoach(this.form).subscribe({
      next: r => {
        this.result = r;
        this.analysing = false;
      },
      error: err => {
        this.analysing = false;
        this.error = err.error?.message || 'Analysis failed. Please try again.';
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  }
}
