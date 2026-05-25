import {
  Component, OnInit, OnDestroy,
  AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import {
  DashboardData
} from '../../../core/models/ml-dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, SkeletonModule],
  template: `
    <div class="ss-dash">

      <!-- Header -->
      <div class="ss-dash-header">
        <div>
          <h1 class="ss-dash-title">Admin intelligence dashboard</h1>
          <p class="ss-dash-subtitle">
            <span class="ss-status-dot" [class.live]="data?.isLive"></span>
            {{ data?.isLive
               ? 'Live data · Updated ' + (data?.lastUpdated | date:'HH:mm:ss')
               : 'Mock data · Click Refresh for live' }}
            &nbsp;·&nbsp; All 6 ML services wired
          </p>
        </div>
        <button class="ss-refresh-btn" [disabled]="refreshing" (click)="onRefresh()">
          <i [class]="'pi ' + (refreshing ? 'pi-spin pi-spinner' : 'pi-refresh')"></i>
          {{ refreshing ? 'Fetching live data...' : 'Refresh from ML APIs' }}
        </button>
      </div>

      <!-- KPI Cards -->
      <p class="ss-section-label">Platform overview</p>
      <div class="ss-kpi-grid">
        <div class="ss-kpi">
          <p class="ss-kpi-label">Total revenue</p>
          <p class="ss-kpi-value">₹{{ formatCrore(data?.salesSummary?.total_revenue || 42000000) }}</p>
          <p class="ss-kpi-sub">{{ (data?.salesSummary?.total_orders || 128975) | number }} orders</p>
          <span class="ss-badge ss-badge-success">+12% MoM</span>
        </div>
        <div class="ss-kpi">
          <p class="ss-kpi-label">Fraud flagged</p>
          <p class="ss-kpi-value">{{ data?.fraudAlerts?.length || 247 }}</p>
          <p class="ss-kpi-sub">today's orders</p>
          <span class="ss-badge ss-badge-danger">ROC-AUC 0.8052</span>
        </div>
        <div class="ss-kpi">
          <p class="ss-kpi-label">Churn risk</p>
          <p class="ss-kpi-value">16.8%</p>
          <p class="ss-kpi-sub">~946 customers</p>
          <span class="ss-badge ss-badge-warning">Tier 3 highest</span>
        </div>
        <div class="ss-kpi">
          <p class="ss-kpi-label">Avg sentiment</p>
          <p class="ss-kpi-value">{{ data?.sentiment?.positivePct || 78 }}%</p>
          <p class="ss-kpi-sub">positive reviews</p>
          <span class="ss-badge ss-badge-success">Acc {{ (data?.sentiment?.accuracy || 0.9668).toFixed(4) }}</span>
        </div>
        <div class="ss-kpi">
          <p class="ss-kpi-label">Recommendations</p>
          <p class="ss-kpi-value">{{ ((data?.recommendationStats?.catalog_size || 50000) / 1000).toFixed(0) }}K</p>
          <p class="ss-kpi-sub">products catalogued</p>
          <span class="ss-badge ss-badge-info">RMSE {{ data?.recommendationStats?.metrics?.rmse?.toFixed(4) || '0.5252' }}</span>
        </div>
        <div class="ss-kpi">
          <p class="ss-kpi-label">30-day forecast</p>
          <p class="ss-kpi-value">₹{{ formatLakh(data?.forecast?.total_predicted_revenue || 38200000) }}L</p>
          <p class="ss-kpi-sub">predicted revenue</p>
          <span class="ss-badge ss-badge-info">MAPE 42.9%</span>
        </div>
      </div>

      <!-- Row 1: Forecast + States -->
      <div class="ss-two-col">

        <!-- Revenue Forecast Chart -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Revenue forecast · 30 days</span>
            <span class="ss-card-tag">Holt-Winters</span>
          </div>
          <div class="ss-chart-legend">
            <span class="ss-legend-item">
              <span class="ss-legend-line" style="background:#378ADD"></span>Predicted
            </span>
            <span class="ss-legend-item">
              <span class="ss-legend-band" style="background:rgba(55,138,221,0.2)"></span>95% band
            </span>
          </div>
          <div class="ss-chart-wrap" style="height:180px">
            <canvas #forecastCanvas aria-label="30-day revenue forecast"></canvas>
          </div>
          <div class="ss-chart-footer">
            <span>Peak: {{ data?.forecast?.peak_day | date:'EEE d MMM' }} · ₹{{ formatLakh(data?.forecast?.peak_revenue || 140000) }}L</span>
            <span>Total: <strong>₹{{ formatLakh(data?.forecast?.total_predicted_revenue || 38200000) }}L</strong></span>
          </div>
        </div>

        <!-- State Revenue Bars -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Revenue by state</span>
            <span class="ss-card-tag">ForecastingService</span>
          </div>
          <div class="ss-state-grid">
            <div class="ss-state-bars">
              <div *ngFor="let s of getTopStates()" class="ss-state-row">
                <span class="ss-state-name">{{ s.name }}</span>
                <div class="ss-state-bar-bg">
                  <div class="ss-state-bar-fill" [style.width]="s.pct + '%'" [style.background]="s.color"></div>
                </div>
                <span class="ss-state-val">₹{{ (s.value/100000).toFixed(0) }}L</span>
              </div>
            </div>
            <div class="ss-state-right">
              <div class="ss-map-legend">
                <p class="ss-map-legend-label">Revenue intensity</p>
                <div class="ss-legend-swatches">
                  <span class="ss-swatch" style="background:#E6F1FB"></span>
                  <span class="ss-swatch" style="background:#B5D4F4"></span>
                  <span class="ss-swatch" style="background:#85B7EB"></span>
                  <span class="ss-swatch" style="background:#378ADD"></span>
                  <span class="ss-swatch" style="background:#185FA5"></span>
                </div>
                <div class="ss-legend-ends"><span>Low</span><span>High</span></div>
              </div>
              <div class="ss-state-insight">
                <p class="ss-insight-num">53%</p>
                <p class="ss-insight-label">revenue from top 3 states</p>
                <p class="ss-insight-tip">Opportunity: Tier 3 cities in MP, Bihar, Odisha are underserved</p>
              </div>
              <div style="height:100px;position:relative;margin-top:8px">
                <canvas #stateDonutCanvas aria-label="State revenue donut"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Fraud + Sentiment -->
      <div class="ss-two-col">

        <!-- Fraud Alerts -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Fraud alerts</span>
            <span class="ss-card-tag">XGBoost · ROC 0.8052</span>
          </div>
          <div *ngFor="let alert of (data?.fraudAlerts || [])" class="ss-fraud-row">
            <span class="ss-fraud-dot" [style.background]="getFraudDotColor(alert.status)"></span>
            <div class="ss-fraud-info">
              <p class="ss-fraud-id">{{ alert.orderId }}</p>
              <p class="ss-fraud-meta">₹{{ alert.amount | number:'1.0-0' }} · {{ alert.paymentMethod }} · {{ alert.time }}</p>
            </div>
            <span class="ss-fraud-score" [style.color]="getFraudScoreColor(alert.fraudScore)">
              {{ alert.fraudScore.toFixed(3) }}
            </span>
            <p-tag [value]="alert.status" [severity]="getFraudSeverity(alert.status)" styleClass="text-xs"></p-tag>
          </div>
          <div class="ss-card-footer">
            <span>247 flagged today</span>
            <span>₹38.2L protected</span>
          </div>
        </div>

        <!-- Sentiment -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Review sentiment</span>
            <span class="ss-card-tag">TF-IDF · Acc {{ (data?.sentiment?.accuracy || 0.9668).toFixed(4) }}</span>
          </div>
          <div class="ss-sentiment-layout">
            <div style="position:relative;height:120px;width:120px;flex-shrink:0">
              <canvas #sentimentCanvas aria-label="Sentiment donut chart"></canvas>
            </div>
            <div class="ss-sentiment-bars">
              <div class="ss-sent-row">
                <span class="ss-sent-label">Positive</span>
                <div class="ss-sent-bar-bg">
                  <div class="ss-sent-bar" style="background:#639922" [style.width]="(data?.sentiment?.positivePct || 78) + '%'"></div>
                </div>
                <span class="ss-sent-pct" style="color:#3B6D11">{{ data?.sentiment?.positivePct || 78 }}%</span>
              </div>
              <div class="ss-sent-row">
                <span class="ss-sent-label">Neutral</span>
                <div class="ss-sent-bar-bg">
                  <div class="ss-sent-bar" style="background:#888780" [style.width]="(data?.sentiment?.neutralPct || 12) + '%'"></div>
                </div>
                <span class="ss-sent-pct" style="color:#5F5E5A">{{ data?.sentiment?.neutralPct || 12 }}%</span>
              </div>
              <div class="ss-sent-row">
                <span class="ss-sent-label">Negative</span>
                <div class="ss-sent-bar-bg">
                  <div class="ss-sent-bar" style="background:#E24B4A" [style.width]="(data?.sentiment?.negativePct || 10) + '%'"></div>
                </div>
                <span class="ss-sent-pct" style="color:#A32D2D">{{ data?.sentiment?.negativePct || 10 }}%</span>
              </div>
              <p class="ss-sent-total">{{ ((data?.sentiment?.totalReviews || 367000)/1000).toFixed(0) }}K reviews analysed</p>
            </div>
          </div>
          <div class="ss-signal-chips">
            <span class="ss-chip ss-chip-pos">"fast delivery"</span>
            <span class="ss-chip ss-chip-pos">"excellent quality"</span>
            <span class="ss-chip ss-chip-neg">"waste of money"</span>
            <span class="ss-chip ss-chip-neg">"poor quality"</span>
          </div>
        </div>
      </div>

      <!-- Row 3: Churn + Pricing -->
      <div class="ss-two-col">

        <!-- Churn CityTier -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Churn risk by CityTier</span>
            <span class="ss-card-tag">XGBoost · ROC 0.9857</span>
          </div>
          <div *ngFor="let tier of (data?.churnByTier || [])" class="ss-tier-row">
            <span class="ss-tier-label">Tier {{ tier.tier }} · {{ getTierShortLabel(tier.tier) }}</span>
            <div class="ss-tier-bar-bg">
              <div class="ss-tier-bar"
                [style.width]="((tier.churn_rate * 100 / 0.25) * 100) + '%'"
                [style.background]="getTierColor(tier.risk_level)">
              </div>
            </div>
            <span class="ss-tier-pct">{{ (tier.churn_rate * 100).toFixed(1) }}%</span>
            <p-tag [value]="tier.risk_level" [severity]="getRiskSeverity(tier.risk_level)" styleClass="text-xs"></p-tag>
          </div>
          <div class="ss-predictor-chips">
            <p class="ss-section-label" style="margin-bottom:6px">Top predictors</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <span *ngFor="let p of ['Tenure #1','Complaint #2','Last order #3','Satisfaction #4']"
                    class="ss-predictor-chip">{{ p }}</span>
            </div>
          </div>
        </div>

        <!-- Pricing Chart -->
        <div class="ss-card">
          <div class="ss-card-header">
            <span class="ss-card-title">Dynamic pricing benchmarks</span>
            <span class="ss-card-tag">GBR · R² 0.4689</span>
          </div>
          <div class="ss-chart-wrap" style="height:180px">
            <canvas #pricingCanvas aria-label="Category price benchmarks bar chart"></canvas>
          </div>
          <div class="ss-pricing-tips">
            <div class="ss-tip-row">
              <i class="pi pi-calendar ss-tip-icon" aria-hidden="true"></i>
              <span>Month-end (25th+): <strong>+8%</strong> avg order value · Weekend: <strong>+5%</strong></span>
            </div>
            <div class="ss-tip-row">
              <i class="pi pi-star ss-tip-icon" aria-hidden="true"></i>
              <span>Diwali season (Oct–Nov): demand surge <strong>+40%</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Recommendations (full width) -->
      <div class="ss-card">
        <div class="ss-card-header">
          <span class="ss-card-title">Recommendation engine</span>
          <span class="ss-card-tag">SVD collaborative filtering · RMSE {{ data?.recommendationStats?.metrics?.rmse?.toFixed(4) || '0.5252' }}</span>
        </div>
        <div class="ss-rec-stats-grid">
          <div *ngFor="let stat of getRecStats()" class="ss-rec-stat">
            <p class="ss-rec-num">{{ stat.value }}</p>
            <p class="ss-rec-label">{{ stat.label }}</p>
          </div>
        </div>
        <div class="ss-rec-chips">
          <span class="ss-badge ss-badge-info">SVD collaborative filtering for known users</span>
          <span class="ss-badge" style="background:var(--p-surface-100,#f3f4f6);color:var(--p-surface-600,#6b7280)">Popularity fallback for cold-start</span>
          <span class="ss-badge" style="background:var(--p-surface-100,#f3f4f6);color:var(--p-surface-600,#6b7280)">Redis cache · 30-min TTL</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .ss-dash { padding: 0; }
    .ss-dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem;
    }
    .ss-dash-title {
      font-size: 1.25rem; font-weight: 600;
      color: var(--p-surface-900, #111827); margin: 0 0 4px;
    }
    .ss-dash-subtitle {
      font-size: .75rem; color: var(--p-surface-500, #6b7280);
      margin: 0; display: flex; align-items: center; gap: 4px;
    }
    .ss-status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #EF9F27; display: inline-block; flex-shrink: 0;
    }
    .ss-status-dot.live { background: #639922; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
    .ss-refresh-btn {
      padding: .375rem .875rem; border: 1px solid #d1d5db;
      border-radius: 8px; background: transparent; cursor: pointer;
      font-size: .8rem; display: flex; align-items: center; gap: 6px;
      color: var(--p-surface-600, #4b5563);
    }
    .ss-refresh-btn:hover { background: var(--p-surface-50, #f9fafb); }
    .ss-refresh-btn:disabled { opacity: .6; cursor: not-allowed; }
    .ss-section-label {
      font-size: .7rem; font-weight: 500; letter-spacing: .07em;
      text-transform: uppercase; color: var(--p-surface-400, #9ca3af); margin: 0 0 .625rem;
    }
    .ss-kpi-grid {
      display: grid; grid-template-columns: repeat(6, 1fr);
      gap: .625rem; margin-bottom: 1.25rem;
    }
    .ss-kpi {
      background: var(--p-surface-50, #f9fafb);
      border-radius: 8px; padding: .875rem 1rem;
    }
    .ss-kpi-label { font-size: .7rem; color: var(--p-surface-500, #6b7280); margin: 0 0 5px; }
    .ss-kpi-value {
      font-size: 1.25rem; font-weight: 600;
      color: var(--p-surface-900, #111827); margin: 0 0 3px;
    }
    .ss-kpi-sub { font-size: .65rem; color: var(--p-surface-400, #9ca3af); margin: 0 0 5px; }
    .ss-badge {
      display: inline-block; font-size: .65rem; padding: 2px 6px; border-radius: 4px;
    }
    .ss-badge-success { background:#D1FAE5; color:#065F46; }
    .ss-badge-danger { background:#FEE2E2; color:#991B1B; }
    .ss-badge-warning { background:#FEF3C7; color:#92400E; }
    .ss-badge-info { background:#DBEAFE; color:#1E40AF; }
    .ss-card {
      background: #fff; border: 1px solid #f3f4f6;
      border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1rem;
    }
    .ss-card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: .875rem;
    }
    .ss-card-title { font-size: .875rem; font-weight: 600; color: var(--p-surface-800, #1f2937); }
    .ss-card-tag {
      font-size: .7rem; padding: 3px 8px; border-radius: 4px;
      background: var(--p-surface-50, #f9fafb); color: var(--p-surface-500, #6b7280);
    }
    .ss-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .ss-chart-legend { display: flex; gap: 1rem; margin-bottom: .5rem; }
    .ss-legend-item {
      display: flex; align-items: center; gap: 4px;
      font-size: .7rem; color: var(--p-surface-500, #6b7280);
    }
    .ss-legend-line { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
    .ss-legend-band { width: 14px; height: 8px; border-radius: 2px; display: inline-block; }
    .ss-chart-wrap { position: relative; width: 100%; }
    .ss-chart-footer {
      display: flex; justify-content: space-between; margin-top: .5rem;
      font-size: .7rem; color: var(--p-surface-500, #6b7280);
    }
    .ss-state-grid { display: grid; grid-template-columns: 1fr 120px; gap: .75rem; }
    .ss-state-bars { display: flex; flex-direction: column; gap: 2px; }
    .ss-state-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; }
    .ss-state-name {
      font-size: .7rem; min-width: 88px; color: var(--p-surface-500, #6b7280);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ss-state-bar-bg { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
    .ss-state-bar-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
    .ss-state-val {
      font-size: .7rem; font-weight: 600; min-width: 34px; text-align: right;
      color: var(--p-surface-800, #1f2937);
    }
    .ss-state-right { display: flex; flex-direction: column; gap: 8px; }
    .ss-map-legend-label { font-size: .65rem; color: var(--p-surface-400, #9ca3af); margin: 0 0 4px; }
    .ss-legend-swatches { display: flex; gap: 2px; }
    .ss-swatch { width: 20px; height: 8px; border-radius: 2px; display: inline-block; }
    .ss-legend-ends {
      display: flex; justify-content: space-between; font-size: .6rem;
      color: var(--p-surface-400, #9ca3af); margin-top: 2px; width: 108px;
    }
    .ss-state-insight { background: var(--p-surface-50, #f9fafb); border-radius: 8px; padding: 8px; }
    .ss-insight-num { font-size: 1.1rem; font-weight: 600; color: var(--p-surface-900, #111827); margin: 0; }
    .ss-insight-label { font-size: .65rem; color: var(--p-surface-500, #6b7280); margin: 2px 0 4px; }
    .ss-insight-tip { font-size: .6rem; color: var(--p-surface-400, #9ca3af); margin: 0; }
    .ss-card-footer {
      display: flex; justify-content: space-between; padding-top: .625rem;
      border-top: 1px solid #f3f4f6; font-size: .7rem;
      color: var(--p-surface-400, #9ca3af); margin-top: .5rem;
    }
    .ss-fraud-row {
      display: flex; align-items: center; gap: .625rem;
      padding: .5rem 0; border-bottom: 1px solid #f9fafb;
    }
    .ss-fraud-row:last-of-type { border-bottom: none; }
    .ss-fraud-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ss-fraud-info { flex: 1; min-width: 0; }
    .ss-fraud-id { font-size: .75rem; font-weight: 600; color: var(--p-surface-800, #1f2937); margin: 0; }
    .ss-fraud-meta { font-size: .65rem; color: var(--p-surface-400, #9ca3af); margin: 0; }
    .ss-fraud-score { font-size: .8rem; font-weight: 600; }
    .ss-sentiment-layout { display: flex; gap: .75rem; align-items: center; margin-bottom: .75rem; }
    .ss-sentiment-bars { flex: 1; }
    .ss-sent-row { display: flex; align-items: center; gap: .5rem; padding: 4px 0; }
    .ss-sent-label { font-size: .7rem; min-width: 56px; color: var(--p-surface-500, #6b7280); }
    .ss-sent-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .ss-sent-bar { height: 100%; border-radius: 4px; transition: width .4s ease; }
    .ss-sent-pct { font-size: .7rem; font-weight: 600; min-width: 30px; text-align: right; }
    .ss-sent-total { font-size: .65rem; color: var(--p-surface-400, #9ca3af); margin: 4px 0 0; }
    .ss-signal-chips {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding-top: .625rem; border-top: 1px solid #f3f4f6;
    }
    .ss-chip { font-size: .65rem; padding: 3px 8px; border-radius: 4px; }
    .ss-chip-pos { background: #D1FAE5; color: #065F46; }
    .ss-chip-neg { background: #FEE2E2; color: #991B1B; }
    .ss-tier-row {
      display: flex; align-items: center; gap: .625rem;
      padding: .4rem 0; border-bottom: 1px solid #f9fafb;
    }
    .ss-tier-row:last-of-type { border-bottom: none; }
    .ss-tier-label { font-size: .7rem; min-width: 90px; color: var(--p-surface-500, #6b7280); }
    .ss-tier-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .ss-tier-bar { height: 100%; border-radius: 4px; transition: width .4s ease; }
    .ss-tier-pct {
      font-size: .75rem; font-weight: 600; min-width: 36px;
      text-align: right; color: var(--p-surface-800, #1f2937);
    }
    .ss-predictor-chips { padding-top: .75rem; border-top: 1px solid #f3f4f6; margin-top: .5rem; }
    .ss-predictor-chip {
      display: inline-block; font-size: .65rem; padding: 3px 8px; border-radius: 4px;
      background: var(--p-surface-50, #f9fafb); color: var(--p-surface-500, #6b7280);
    }
    .ss-pricing-tips { padding-top: .625rem; border-top: 1px solid #f3f4f6; }
    .ss-tip-row {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 4px 0; font-size: .72rem; color: var(--p-surface-500, #6b7280);
    }
    .ss-tip-icon { color: #1E40AF; font-size: .8rem; flex-shrink: 0; margin-top: 1px; }
    .ss-rec-stats-grid {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: .625rem; margin-bottom: .75rem;
    }
    .ss-rec-stat {
      text-align: center; background: var(--p-surface-50, #f9fafb);
      border-radius: 8px; padding: .875rem .5rem;
    }
    .ss-rec-num { font-size: 1.1rem; font-weight: 600; color: var(--p-surface-900, #111827); margin: 0 0 3px; }
    .ss-rec-label { font-size: .65rem; color: var(--p-surface-500, #6b7280); margin: 0; }
    .ss-rec-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('forecastCanvas') forecastCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stateDonutCanvas') stateDonutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sentimentCanvas') sentimentCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pricingCanvas') pricingCanvas!: ElementRef<HTMLCanvasElement>;

  data: DashboardData | null = null;
  refreshing = false;

  private charts: Chart[] = [];

  constructor(
    private dashboardService: DashboardService,
    public router: Router
  ) {}

  ngOnInit() {
    this.data = this.dashboardService.getMockDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  // ── Public helpers ──

  onRefresh() {
    this.refreshing = true;
    this.dashboardService.getLiveDashboardData().subscribe({
      next: liveData => {
        this.data = liveData;
        this.refreshing = false;
        this.destroyCharts();
        setTimeout(() => this.initCharts(), 100);
      },
      error: () => { this.refreshing = false; }
    });
  }

  formatCrore(n: number): string {
    return (n / 10000000).toFixed(1) + 'Cr';
  }

  formatLakh(n: number): string {
    return (n / 100000).toFixed(1);
  }

  getTopStates(): any[] {
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

  getRecStats(): any[] {
    const s = this.data?.recommendationStats;
    return [
      { value: ((s?.catalog_size || 50000) / 1000).toFixed(0) + 'K', label: 'Products catalogued' },
      { value: '5,000', label: 'Users trained' },
      { value: '61.7K', label: 'Interactions' },
      { value: '30 min', label: 'Redis TTL' },
      { value: s?.metrics?.rmse?.toFixed(4) || '0.5252', label: 'Train RMSE' }
    ];
  }

  getFraudDotColor(status: string): string {
    const map: Record<string, string> = { Hold: '#E24B4A', Review: '#EF9F27', Clear: '#639922' };
    return map[status] || '#888780';
  }

  getFraudScoreColor(score: number): string {
    if (score >= 0.75) return '#A32D2D';
    if (score >= 0.50) return '#854F0B';
    return '#3B6D11';
  }

  getFraudSeverity(status: string): string {
    const map: Record<string, string> = { Hold: 'danger', Review: 'warn', Clear: 'success' };
    return map[status] || 'info';
  }

  getTierShortLabel(tier: number): string {
    const map: Record<number, string> = { 1: 'Metro', 2: 'Mid-size', 3: 'Small town' };
    return map[tier] || '';
  }

  getTierColor(riskLevel: string): string {
    const map: Record<string, string> = {
      LOW: '#378ADD', MEDIUM: '#EF9F27', HIGH: '#E24B4A', CRITICAL: '#A32D2D'
    };
    return map[riskLevel] || '#888780';
  }

  getRiskSeverity(riskLevel: string): string {
    const map: Record<string, string> = {
      LOW: 'success', MEDIUM: 'warn', HIGH: 'danger', CRITICAL: 'danger'
    };
    return map[riskLevel] || 'info';
  }

  // ── Chart initialisation ──

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private initCharts() {
    this.initForecastChart();
    this.initStateDonut();
    this.initSentimentDonut();
    this.initPricingChart();
  }

  private initForecastChart() {
    if (!this.forecastCanvas?.nativeElement) return;
    const ctx = this.forecastCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const points = this.data?.forecast?.forecast || [];
    const labels = points.map(p =>
      new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    const predicted = points.map(p => p.predicted_revenue);
    const lower = points.map(p => p.lower_bound);
    const upper = points.map(p => p.upper_bound);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Upper',
            data: upper,
            borderColor: 'transparent',
            backgroundColor: 'rgba(55,138,221,0.12)',
            fill: '+1',
            pointRadius: 0,
            tension: 0.35
          },
          {
            label: 'Predicted',
            data: predicted,
            borderColor: '#378ADD',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.35,
            fill: false
          },
          {
            label: 'Lower',
            data: lower,
            borderColor: 'transparent',
            backgroundColor: 'rgba(55,138,221,0.12)',
            fill: '-1',
            pointRadius: 0,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => '₹' + Math.round(c.raw as number).toLocaleString('en-IN')
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
            grid: { display: false }
          },
          y: {
            ticks: {
              font: { size: 10 },
              callback: v => '₹' + ((v as number) / 100000).toFixed(1) + 'L'
            },
            grid: { color: 'rgba(128,128,128,0.08)' }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private initStateDonut() {
    if (!this.stateDonutCanvas?.nativeElement) return;
    const ctx = this.stateDonutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const states = this.data?.salesSummary?.top_states || {};
    const entries = Object.entries(states)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
    const others = Object.entries(states)
      .slice(5)
      .reduce((s, [, v]) => s + (v as number), 0);

    const labels = [...entries.map(([k]) => k.charAt(0) + k.slice(1).toLowerCase()), 'Others'];
    const vals = [...entries.map(([, v]) => v as number), others];

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: vals,
          backgroundColor: ['#185FA5','#378ADD','#85B7EB','#B5D4F4','#E6F1FB','#D3D1C7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: c => c.label + ': ₹' + ((c.raw as number) / 100000).toFixed(0) + 'L'
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private initSentimentDonut() {
    if (!this.sentimentCanvas?.nativeElement) return;
    const ctx = this.sentimentCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const s = this.data?.sentiment;
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [s?.positivePct || 78, s?.neutralPct || 12, s?.negativePct || 10],
          backgroundColor: ['#639922', '#888780', '#E24B4A'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: c => c.label + ': ' + c.raw + '%' }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private initPricingChart() {
    if (!this.pricingCanvas?.nativeElement) return;
    const ctx = this.pricingCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const benchmarks = this.data?.pricingBenchmarks || [];
    const labels = benchmarks.map(b => b.category);
    const avgPrices = benchmarks.map(b => b.avg_price);
    const medianPrices = benchmarks.map(b => b.median_price);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Price (Rs.)',
            data: avgPrices,
            backgroundColor: '#378ADD',
            borderRadius: 4,
            borderSkipped: false
          },
          {
            label: 'Median Price (Rs.)',
            data: medianPrices,
            backgroundColor: '#B5D4F4',
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { font: { size: 10 }, boxWidth: 10, padding: 8 }
          },
          tooltip: {
            callbacks: {
              label: c => c.dataset.label + ': Rs.' + (c.raw as number).toLocaleString('en-IN')
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              font: { size: 10 },
              callback: v => 'Rs.' + (v as number).toLocaleString('en-IN')
            },
            grid: { color: 'rgba(128,128,128,0.08)' }
          }
        }
      }
    });
    this.charts.push(chart);
  }
}
