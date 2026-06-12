import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardData } from '../../../core/models/ml-dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgStyle, ButtonModule, TagModule, DividerModule],
  template: `
    <div style="padding:0">

      <!-- ── Header ── -->
      <div style="display:flex !important;justify-content:space-between;
                  align-items:center;margin-bottom:1.5rem;
                  flex-wrap:wrap;gap:.75rem;
                  visibility:visible !important;opacity:1 !important;
                  position:relative;z-index:10;
                  padding:1rem 1.25rem;
                  background:#ffffff;
                  border:1px solid #f3f4f6;border-radius:12px">
        <div>
          <div style="font-size:1.25rem !important;font-weight:600 !important;
                      color:#111827 !important;margin:0 0 4px !important;
                      display:block !important;line-height:1.3">
            Admin intelligence dashboard
          </div>
          <p style="font-size:.75rem;color:#6b7280;margin:0;
                    display:flex;align-items:center;gap:4px">
            <span style="display:inline-block;width:7px;height:7px;
                         border-radius:50%;vertical-align:middle"
              [style.background]="data?.isLive ? '#639922' : '#EF9F27'">
            </span>
            {{ data?.isLive ? 'Live data' : 'Mock data · Click Refresh for live' }}
            &nbsp;&middot;&nbsp; All 6 ML services wired
          </p>
        </div>
        <button
          (click)="onRefresh()"
          [disabled]="refreshing"
          style="display:inline-flex !important;visibility:visible !important;
                 align-items:center;gap:6px;
                 padding:.5rem 1rem;
                 background:#ffffff;border:1px solid #e5e7eb;
                 border-radius:8px;font-size:.8rem;
                 color:#374151;cursor:pointer">
          <i [class]="refreshing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
          {{ refreshing ? 'Fetching...' : 'Refresh from ML APIs' }}
        </button>
      </div>

      <!-- ── KPI Cards ── -->
      <p style="font-size:.7rem;font-weight:500;letter-spacing:.07em;
                text-transform:uppercase;color:#9ca3af;margin:0 0 .625rem">
        Platform overview
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
                  gap:.625rem;margin-bottom:1.25rem">
        <div *ngFor="let kpi of getKpis()"
             style="background:#f9fafb;border-radius:8px;padding:.875rem 1rem">
          <p style="font-size:.7rem;color:#6b7280;margin:0 0 5px">{{ kpi.label }}</p>
          <p style="font-size:1.2rem;font-weight:600;color:#111827;margin:0 0 3px">
            {{ kpi.value }}
          </p>
          <p style="font-size:.65rem;color:#9ca3af;margin:0 0 5px">{{ kpi.sub }}</p>
          <span style="display:inline-block;font-size:.65rem;padding:2px 6px;border-radius:4px"
            [style.background]="kpi.badgeBg"
            [style.color]="kpi.badgeColor">
            {{ kpi.badge }}
          </span>
        </div>
      </div>

      <!-- ── Row 1: Forecast + States ── -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">

        <!-- Forecast bars -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-chart-line" style="color:#378ADD"></i>
              Revenue forecast &middot; 30 days
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">Holt-Winters</span>
          </div>
          <div style="display:flex;align-items:flex-end;gap:2px;height:120px;padding-bottom:4px">
            <div *ngFor="let p of getForecastBars()"
                 style="flex:1;border-radius:2px 2px 0 0;min-width:4px;transition:height .3s ease"
                 [style.height]="p.heightPct + '%'"
                 [style.background]="p.isWeekend ? '#185FA5' : '#85B7EB'"
                 [title]="p.date + ': ₹' + (p.value/100000).toFixed(1) + 'L'">
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:6px">
            <span style="display:flex;align-items:center;gap:4px;font-size:.68rem;color:#6b7280">
              <span style="width:10px;height:8px;background:#85B7EB;border-radius:2px;display:inline-block"></span>Weekday
            </span>
            <span style="display:flex;align-items:center;gap:4px;font-size:.68rem;color:#6b7280">
              <span style="width:10px;height:8px;background:#185FA5;border-radius:2px;display:inline-block"></span>Weekend peak
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:.7rem;
                      color:#6b7280;border-top:1px solid #f3f4f6;padding-top:8px">
            <span>Peak: {{ rupee(formatLakh(data?.forecast?.peak_revenue || 155000)) }}L</span>
            <span>Total: <strong>{{ rupee(formatLakh(data?.forecast?.total_predicted_revenue || 38200000)) }}L</strong></span>
          </div>
        </div>

        <!-- State Revenue bars -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-map-marker" style="color:#378ADD"></i>
              Revenue by state
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">ForecastingService</span>
          </div>
          <div *ngFor="let s of getTopStates()"
               style="display:flex;align-items:center;gap:8px;padding:3px 0">
            <span style="font-size:.7rem;min-width:88px;color:#6b7280;
                         white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ s.name }}
            </span>
            <div style="flex:1;height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden">
              <div style="height:100%;border-radius:3px;transition:width .4s ease"
                [style.width]="s.pct + '%'"
                [style.background]="s.color">
              </div>
            </div>
            <span style="font-size:.7rem;font-weight:600;min-width:38px;text-align:right;color:#1f2937">
              {{ rupee((s.value/100000).toFixed(0)) }}L
            </span>
          </div>
          <div style="margin-top:10px;background:#f9fafb;border-radius:8px;padding:10px">
            <p style="font-size:1rem;font-weight:600;color:#111827;margin:0 0 2px">53%</p>
            <p style="font-size:.65rem;color:#6b7280;margin:0 0 4px">revenue from top 3 states</p>
            <p style="font-size:.6rem;color:#9ca3af;margin:0">
              Opportunity: MP, Bihar, Odisha are underserved
            </p>
          </div>
        </div>
      </div>

      <!-- ── Row 2: Fraud + Sentiment ── -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">

        <!-- Fraud Alerts -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-shield" style="color:#E24B4A"></i>
              Fraud alerts
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">XGBoost &middot; ROC 0.8052</span>
          </div>
          <div *ngFor="let alert of (data?.fraudAlerts || [])"
               style="display:flex;align-items:center;gap:8px;padding:7px 0;
                      border-bottom:1px solid #f9fafb">
            <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0"
              [style.background]="getFraudDotColor(alert.status)">
            </span>
            <div style="flex:1;min-width:0">
              <p style="font-size:.75rem;font-weight:600;color:#1f2937;margin:0">
                {{ alert.orderId }}
              </p>
              <p style="font-size:.65rem;color:#9ca3af;margin:0">
                {{ rupee(alert.amount | number:'1.0-0') }}
                &middot; {{ alert.paymentMethod }}
                &middot; {{ alert.time }}
              </p>
            </div>
            <span style="font-size:.8rem;font-weight:600"
              [style.color]="getFraudScoreColor(alert.fraudScore)">
              {{ alert.fraudScore.toFixed(3) }}
            </span>
            <p-tag [value]="alert.status"
                   [severity]="getFraudSeverity(alert.status)"
                   styleClass="text-xs">
            </p-tag>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:.625rem;
                      font-size:.7rem;color:#9ca3af">
            <span>247 flagged today</span>
            <span>{{ rupee('38.2L') }} protected</span>
          </div>
        </div>

        <!-- Sentiment -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-comments" style="color:#639922"></i>
              Review sentiment
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">
              TF-IDF &middot; Acc {{ (data?.sentiment?.accuracy || 0.9668).toFixed(4) }}
            </span>
          </div>

          <!-- Donut + bars side by side -->
          <div style="display:flex;gap:.75rem;align-items:center;margin-bottom:12px">

            <!-- Donut (left) -->
            <div style="position:relative;width:110px;height:110px;flex-shrink:0">
              <div [ngStyle]="{'background': getSentimentGradient()}"
                   style="width:110px;height:110px;border-radius:50%">
              </div>
              <div style="position:absolute;top:50%;left:50%;
                          transform:translate(-50%,-50%);
                          width:68px;height:68px;border-radius:50%;
                          background:#ffffff;display:flex;
                          align-items:center;justify-content:center">
                <span style="font-size:.95rem;font-weight:600;color:#065F46">
                  {{ data?.sentiment?.positivePct || 78 }}%
                </span>
              </div>
            </div>

            <!-- Bars (right) -->
            <div style="flex:1">
              <div *ngFor="let s of getSentimentBars()"
                   style="display:flex;align-items:center;gap:8px;padding:4px 0">
                <span style="font-size:.7rem;min-width:56px;color:#6b7280">{{ s.label }}</span>
                <div style="flex:1;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden">
                  <div style="height:100%;border-radius:4px"
                    [style.width]="s.pct + '%'"
                    [style.background]="s.color">
                  </div>
                </div>
                <span style="font-size:.7rem;font-weight:600;min-width:30px;text-align:right"
                  [style.color]="s.textColor">
                  {{ s.pct }}%
                </span>
              </div>
            </div>

          </div>

          <div style="margin-top:10px;padding-top:8px;border-top:1px solid #f3f4f6;
                      display:flex;flex-wrap:wrap;gap:6px">
            <span style="font-size:.65rem;padding:3px 8px;border-radius:4px;
                         background:#D1FAE5;color:#065F46">"fast delivery"</span>
            <span style="font-size:.65rem;padding:3px 8px;border-radius:4px;
                         background:#D1FAE5;color:#065F46">"excellent quality"</span>
            <span style="font-size:.65rem;padding:3px 8px;border-radius:4px;
                         background:#FEE2E2;color:#991B1B">"waste of money"</span>
          </div>
        </div>
      </div>

      <!-- ── Row 3: Churn + Pricing ── -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">

        <!-- Churn CityTier -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-users" style="color:#EF9F27"></i>
              Churn risk by CityTier
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">XGBoost &middot; ROC 0.9857</span>
          </div>

          <!-- CSS conic-gradient donut -->
          <div style="display:flex;justify-content:center;margin-bottom:12px">
            <div style="position:relative;width:90px;height:90px">
              <div [ngStyle]="{'background': getChurnGradient()}"
                   style="width:90px;height:90px;border-radius:50%">
              </div>
              <div style="position:absolute;top:50%;left:50%;
                          transform:translate(-50%,-50%);
                          width:56px;height:56px;border-radius:50%;
                          background:#ffffff;display:flex;
                          align-items:center;justify-content:center;
                          flex-direction:column">
                <span style="font-size:.75rem;font-weight:600;color:#1f2937">16.8%</span>
                <span style="font-size:.55rem;color:#9ca3af">avg churn</span>
              </div>
            </div>
          </div>

          <!-- Tier bars -->
          <div *ngFor="let tier of (data?.churnByTier || [])"
               style="display:flex;align-items:center;gap:8px;padding:6px 0;
                      border-bottom:1px solid #f9fafb">
            <span style="font-size:.7rem;min-width:90px;color:#6b7280">
              Tier {{ tier.tier }} &middot; {{ getTierShort(tier.tier) }}
            </span>
            <div style="flex:1;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden">
              <div style="height:100%;border-radius:4px;transition:width .4s"
                [style.width]="(tier.churn_rate / 0.25 * 100) + '%'"
                [style.background]="getTierColor(tier.risk_level)">
              </div>
            </div>
            <span style="font-size:.75rem;font-weight:600;min-width:36px;
                         text-align:right;color:#1f2937">
              {{ (tier.churn_rate * 100).toFixed(1) }}%
            </span>
            <p-tag [value]="tier.risk_level"
                   [severity]="getRiskSeverity(tier.risk_level)"
                   styleClass="text-xs">
            </p-tag>
          </div>
          <div style="padding-top:.75rem;border-top:1px solid #f3f4f6;margin-top:.5rem">
            <p style="font-size:.65rem;color:#9ca3af;margin:0 0 6px">Top churn predictors</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <span *ngFor="let p of ['Tenure #1','Complaint #2','Last order #3','Satisfaction #4']"
                style="font-size:.65rem;padding:3px 8px;border-radius:4px;
                       background:#f9fafb;color:#6b7280">{{ p }}</span>
            </div>
          </div>
        </div>

        <!-- Pricing CSS bars -->
        <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                    padding:1rem 1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:.875rem">
            <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                         display:flex;align-items:center;gap:6px">
              <i class="pi pi-tag" style="color:#185FA5"></i>
              Pricing benchmarks
            </span>
            <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                         background:#f9fafb;color:#6b7280">GBR &middot; R² 0.4689</span>
          </div>
          <div *ngFor="let b of (data?.pricingBenchmarks || [])"
               style="display:flex;align-items:center;gap:8px;padding:5px 0;
                      border-bottom:1px solid #f9fafb">
            <span style="font-size:.75rem;min-width:90px;color:#1f2937;font-weight:500">
              {{ b.category }}
            </span>
            <div style="flex:1;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden">
              <div style="height:100%;border-radius:4px;background:#378ADD;transition:width .4s"
                [style.width]="getPricingBarWidth(b.avg_price) + '%'">
              </div>
            </div>
            <span style="font-size:.75rem;font-weight:600;min-width:56px;
                         text-align:right;color:#1f2937">
              {{ rupee(b.avg_price | number:'1.0-0') }}
            </span>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid #f3f4f6">
            <div style="display:flex;align-items:flex-start;gap:6px;padding:3px 0;
                        font-size:.72rem;color:#6b7280">
              <i class="pi pi-calendar" style="color:#1E40AF;font-size:.8rem;margin-top:1px"></i>
              <span>Month-end (25th+): <strong>+8%</strong> avg order &middot; Weekend: <strong>+5%</strong></span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:6px;padding:3px 0;
                        font-size:.72rem;color:#6b7280">
              <i class="pi pi-bolt" style="color:#1E40AF;font-size:.8rem;margin-top:1px"></i>
              <span>Diwali (Oct&ndash;Nov): demand <strong>+40%</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Row 4: Recommendations ── -->
      <div style="background:#fff;border:1px solid #f3f4f6;border-radius:12px;
                  padding:1rem 1.25rem;margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;
                    margin-bottom:.875rem">
          <span style="font-size:.875rem;font-weight:600;color:#1f2937;
                       display:flex;align-items:center;gap:6px">
            <i class="pi pi-star" style="color:#8B5CF6"></i>
            Recommendation engine
          </span>
          <span style="font-size:.7rem;padding:3px 8px;border-radius:4px;
                       background:#f9fafb;color:#6b7280">
            SVD collaborative filtering &middot; RMSE {{
              data?.recommendationStats?.metrics?.rmse?.toFixed(4) || '0.5252' }}
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);
                    gap:.625rem;margin-bottom:.75rem">
          <div *ngFor="let stat of getRecStats()"
               style="text-align:center;background:#f9fafb;border-radius:8px;
                      padding:.875rem .5rem">
            <p style="font-size:1.1rem;font-weight:600;color:#111827;margin:0 0 3px">
              {{ stat.value }}
            </p>
            <p style="font-size:.65rem;color:#6b7280;margin:0">{{ stat.label }}</p>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <span style="font-size:.68rem;padding:4px 10px;border-radius:4px;
                       background:#DBEAFE;color:#1E40AF">SVD collaborative filtering for known users</span>
          <span style="font-size:.68rem;padding:4px 10px;border-radius:4px;
                       background:#f9fafb;color:#6b7280">Popularity fallback for cold-start</span>
          <span style="font-size:.68rem;padding:4px 10px;border-radius:4px;
                       background:#f9fafb;color:#6b7280">Redis cache &middot; 30-min TTL</span>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {

  data: DashboardData | null = null;
  refreshing = false;

  constructor(
    private dashboardService: DashboardService,
    public router: Router
  ) {}

  ngOnInit() {
    this.data = this.dashboardService.getMockDashboardData();
  }

  onRefresh() {
    this.refreshing = true;
    this.dashboardService.getLiveDashboardData().subscribe({
      next: d => { this.data = d; this.refreshing = false; },
      error: () => { this.refreshing = false; }
    });
  }

  // ── helpers ──

  rupee(val: string | number | null): string {
    return '₹' + (val ?? '');
  }

  formatLakh(n: number): string {
    return (n / 100000).toFixed(1);
  }

  formatCrore(n: number): string {
    return (n / 10000000).toFixed(1) + 'Cr';
  }

  // ── donut gradients (ngStyle-safe string concatenation) ──

  getSentimentGradient(): string {
    const pos = this.data?.sentiment?.positivePct ?? 78;
    const neu = this.data?.sentiment?.neutralPct ?? 12;
    return 'conic-gradient(#639922 0% ' + pos + '%, #888780 ' + pos + '% ' + (pos + neu) + '%, #E24B4A ' + (pos + neu) + '% 100%)';
  }

  getChurnGradient(): string {
    const tiers = this.data?.churnByTier ?? [];
    const t1 = (tiers.find(t => t.tier === 1)?.churn_rate ?? 0.145) * 100;
    const t2 = (tiers.find(t => t.tier === 2)?.churn_rate ?? 0.198) * 100;
    const t3 = (tiers.find(t => t.tier === 3)?.churn_rate ?? 0.214) * 100;
    const total = t1 + t2 + t3;
    const p1 = (t1 / total * 100);
    const p2 = ((t1 + t2) / total * 100);
    return 'conic-gradient(#378ADD 0% ' + p1.toFixed(1) + '%, #EF9F27 ' + p1.toFixed(1) + '% ' + p2.toFixed(1) + '%, #E24B4A ' + p2.toFixed(1) + '% 100%)';
  }

  // ── data methods ──

  getKpis() {
    const d = this.data;
    return [
      {
        label: 'Total revenue',
        value: this.rupee(this.formatCrore(d?.salesSummary?.total_revenue || 42000000)),
        sub: (d?.salesSummary?.total_orders || 128975).toLocaleString() + ' orders',
        badge: '+12% MoM', badgeBg: '#D1FAE5', badgeColor: '#065F46'
      },
      {
        label: 'Fraud flagged',
        value: String(d?.fraudAlerts?.length || 247),
        sub: "today's orders",
        badge: 'ROC-AUC 0.8052', badgeBg: '#FEE2E2', badgeColor: '#991B1B'
      },
      {
        label: 'Churn risk',
        value: '16.8%',
        sub: '~946 customers',
        badge: 'Tier 3 highest', badgeBg: '#FEF3C7', badgeColor: '#92400E'
      },
      {
        label: 'Avg sentiment',
        value: (d?.sentiment?.positivePct || 78) + '%',
        sub: 'positive reviews',
        badge: 'Acc ' + (d?.sentiment?.accuracy || 0.9668).toFixed(4),
        badgeBg: '#D1FAE5', badgeColor: '#065F46'
      },
      {
        label: 'Recommendations',
        value: ((d?.recommendationStats?.catalog_size || 50000) / 1000).toFixed(0) + 'K',
        sub: 'products catalogued',
        badge: 'RMSE ' + (d?.recommendationStats?.metrics?.rmse?.toFixed(4) || '0.5252'),
        badgeBg: '#DBEAFE', badgeColor: '#1E40AF'
      },
      {
        label: '30-day forecast',
        value: this.rupee(this.formatLakh(d?.forecast?.total_predicted_revenue || 38200000)) + 'L',
        sub: 'predicted revenue',
        badge: 'Holt-Winters', badgeBg: '#DBEAFE', badgeColor: '#1E40AF'
      }
    ];
  }

  getForecastBars() {
    const points = this.data?.forecast?.forecast || [];
    if (points.length === 0) return [];
    const maxVal = Math.max(...points.map(p => p.predicted_revenue));
    return points.map(p => ({
      date: p.date,
      value: p.predicted_revenue,
      heightPct: Math.round((p.predicted_revenue / maxVal) * 90) + 10,
      isWeekend: p.is_weekend
    }));
  }

  getTopStates() {
    const states = this.data?.salesSummary?.top_states || {};
    const entries = Object.entries(states)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8);
    const maxVal = entries.length > 0 ? (entries[0][1] as number) : 1;
    const colors = ['#185FA5','#378ADD','#85B7EB','#B5D4F4','#B5D4F4','#E6F1FB','#E6F1FB','#E6F1FB'];
    return entries.map(([name, value], i) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value: value as number,
      pct: Math.round(((value as number) / maxVal) * 100),
      color: colors[i] || '#E6F1FB'
    }));
  }

  getSentimentBars() {
    const s = this.data?.sentiment;
    return [
      { label: 'Positive', pct: s?.positivePct || 78, color: '#639922', textColor: '#3B6D11' },
      { label: 'Neutral',  pct: s?.neutralPct  || 12, color: '#888780', textColor: '#5F5E5A' },
      { label: 'Negative', pct: s?.negativePct || 10, color: '#E24B4A', textColor: '#A32D2D' }
    ];
  }

  getPricingBarWidth(avgPrice: number): number {
    const maxPrice = Math.max(...(this.data?.pricingBenchmarks?.map(b => b.avg_price) || [2445]));
    return Math.round((avgPrice / maxPrice) * 90) + 10;
  }

  getRecStats() {
    const s = this.data?.recommendationStats;
    return [
      { value: ((s?.catalog_size || 50000) / 1000).toFixed(0) + 'K', label: 'Products catalogued' },
      { value: '5,000',  label: 'Users trained' },
      { value: '61.7K',  label: 'Interactions' },
      { value: '30 min', label: 'Redis TTL' },
      { value: s?.metrics?.rmse?.toFixed(4) || '0.5252', label: 'Train RMSE' }
    ];
  }

  getFraudDotColor(status: string): string {
    return ({ Hold: '#E24B4A', Review: '#EF9F27', Clear: '#639922' } as Record<string,string>)[status] || '#888780';
  }

  getFraudScoreColor(score: number): string {
    if (score >= 0.75) return '#A32D2D';
    if (score >= 0.50) return '#854F0B';
    return '#3B6D11';
  }

  getFraudSeverity(status: string): string {
    return ({ Hold: 'danger', Review: 'warn', Clear: 'success' } as Record<string,string>)[status] || 'info';
  }

  getTierShort(tier: number): string {
    return ({ 1: 'Metro', 2: 'Mid-size', 3: 'Small town' } as Record<number,string>)[tier] || '';
  }

  getTierColor(risk: string): string {
    return ({ LOW: '#378ADD', MEDIUM: '#EF9F27', HIGH: '#E24B4A', CRITICAL: '#A32D2D' } as Record<string,string>)[risk] || '#888780';
  }

  getRiskSeverity(risk: string): string {
    return ({ LOW: 'success', MEDIUM: 'warn', HIGH: 'danger', CRITICAL: 'danger' } as Record<string,string>)[risk] || 'info';
  }
}
