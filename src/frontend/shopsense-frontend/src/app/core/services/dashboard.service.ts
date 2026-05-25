import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DashboardData, ForecastResponse,
  SalesSummaryResponse, FraudAlert,
  SentimentSummary, CityTierChurn,
  CategoryBenchmark, RecommendationStats
} from '../models/ml-dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly ML = {
    fraud:     'http://localhost:8001',
    recommend: 'http://localhost:8002',
    sentiment: 'http://localhost:8003',
    forecast:  'http://localhost:8004',
    churn:     'http://localhost:8005',
    pricing:   'http://localhost:8006'
  };

  constructor(private http: HttpClient) {}

  // ── Mock data (shown instantly on load) ──

  getMockDashboardData(): DashboardData {
    const forecast = this.buildMockForecast();
    return {
      forecast,
      salesSummary: {
        total_revenue: 42000000,
        total_orders: 128975,
        avg_order_value: 325,
        avg_daily_revenue: 117414,
        max_daily_revenue: 487000,
        date_range: { start: '2022-04-01', end: '2022-06-29', days: 89 },
        monthly_revenue: {
          'Apr 2022': 12800000,
          'May 2022': 15400000,
          'Jun 2022': 13800000
        },
        top_states: {
          'MAHARASHTRA': 8900000,
          'KARNATAKA': 6600000,
          'TELANGANA': 5200000,
          'UTTAR PRADESH': 4400000,
          'TAMIL NADU': 3800000,
          'DELHI': 3400000,
          'RAJASTHAN': 2800000,
          'WEST BENGAL': 2200000
        },
        category_revenue: {
          'Set': 9800000,
          'kurta': 8400000,
          'Western Dress': 7200000,
          'Top': 6100000,
          'Ethnic Dress': 5400000
        }
      },
      fraudAlerts: [
        { orderId: 'SS20260524-9834', amount: 94500, paymentMethod: 'Credit Card', fraudScore: 0.987, riskLevel: 'CRITICAL', time: '2:14am', status: 'Hold' },
        { orderId: 'SS20260524-8201', amount: 67200, paymentMethod: 'Debit Card', fraudScore: 0.923, riskLevel: 'CRITICAL', time: '3:02am', status: 'Hold' },
        { orderId: 'SS20260524-7745', amount: 38000, paymentMethod: 'COD', fraudScore: 0.781, riskLevel: 'HIGH', time: '4:17am', status: 'Review' },
        { orderId: 'SS20260524-6612', amount: 1299, paymentMethod: 'UPI', fraudScore: 0.043, riskLevel: 'LOW', time: '2:30pm', status: 'Clear' }
      ],
      sentiment: {
        positiveCount: 287000, neutralCount: 44000, negativeCount: 36000,
        totalReviews: 367000,
        positivePct: 78, neutralPct: 12, negativePct: 10,
        accuracy: 0.9668
      },
      churnByTier: [
        { tier: 1, label: 'Tier 1 — Metro (Mumbai, Delhi, Bangalore)', churn_rate: 0.145, avg_tenure_months: 18.2, avg_satisfaction: 3.8, risk_level: 'LOW', customer_count: 1840 },
        { tier: 2, label: 'Tier 2 — Mid-size (Pune, Jaipur, Lucknow)', churn_rate: 0.198, avg_tenure_months: 14.6, avg_satisfaction: 3.4, risk_level: 'MEDIUM', customer_count: 2210 },
        { tier: 3, label: 'Tier 3 — Small Town', churn_rate: 0.214, avg_tenure_months: 12.1, avg_satisfaction: 3.1, risk_level: 'MEDIUM', customer_count: 1580 }
      ],
      pricingBenchmarks: [
        { category: 'Set', avg_price: 2445, median_price: 2100, order_count: 28400, price_range_label: 'Premium' },
        { category: 'Ethnic Dress', avg_price: 1845, median_price: 1650, order_count: 22100, price_range_label: 'Premium' },
        { category: 'kurta', avg_price: 1123, median_price: 999, order_count: 31200, price_range_label: 'Mid-range' },
        { category: 'Western Dress', avg_price: 987, median_price: 850, order_count: 18900, price_range_label: 'Mid-range' },
        { category: 'Top', avg_price: 612, median_price: 550, order_count: 24600, price_range_label: 'Budget' }
      ],
      recommendationStats: {
        catalog_size: 50000,
        model_loaded: true,
        metrics: { rmse: 0.5252 },
        trained_at: new Date().toISOString()
      },
      isLive: false,
      lastUpdated: new Date()
    };
  }

  private buildMockForecast(): ForecastResponse {
    const forecast: any[] = [];
    const start = new Date('2026-06-01');
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dow = d.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const base = 120000;
      const trend = 1 + (i / 30) * 0.08;
      const mult = isWeekend ? 1.28 : 1.0;
      const noise = 0.88 + Math.random() * 0.24;
      const val = Math.round(base * trend * mult * noise);
      forecast.push({
        date: d.toISOString().split('T')[0],
        predicted_revenue: val,
        lower_bound: Math.round(val * 0.78),
        upper_bound: Math.round(val * 1.22),
        day_of_week: days[dow],
        is_weekend: isWeekend
      });
    }
    const total = forecast.reduce((s, p) => s + p.predicted_revenue, 0);
    const peak = forecast.reduce((a, b) => a.predicted_revenue > b.predicted_revenue ? a : b);
    return {
      forecast_days: 30,
      start_date: forecast[0].date,
      end_date: forecast[29].date,
      total_predicted_revenue: total,
      avg_daily_revenue: Math.round(total / 30),
      peak_day: peak.date,
      peak_revenue: peak.predicted_revenue,
      forecast
    };
  }

  // ── Live API calls ──

  getLiveDashboardData(): Observable<DashboardData> {
    const safe = <T>(obs: Observable<T>) => obs.pipe(catchError(() => of(null)));

    return forkJoin({
      forecast: safe(this.http.get<ForecastResponse>(`${this.ML.forecast}/forecast/sales?days=30`)),
      salesSummary: safe(this.http.get<SalesSummaryResponse>(`${this.ML.forecast}/summary/sales`)),
      churnTiers: safe(this.http.get<CityTierChurn[]>(`${this.ML.churn}/churn/citytier-analysis`)),
      pricingBenchmarks: safe(this.http.get<CategoryBenchmark[]>(`${this.ML.pricing}/pricing/category-benchmarks?limit=5`)),
      recommendInfo: safe(this.http.get<any>(`${this.ML.recommend}/model/info`)),
      sentimentInfo: safe(this.http.get<any>(`${this.ML.sentiment}/model/info`)),
      fraudHealth: safe(this.http.get<any>(`${this.ML.fraud}/health`))
    }).pipe(
      map(results => this.mapLiveResults(results))
    );
  }

  private mapLiveResults(results: any): DashboardData {
    const mock = this.getMockDashboardData();

    const forecast = results.forecast ?? mock.forecast;
    const salesSummary = results.salesSummary ?? mock.salesSummary;
    const churnByTier = results.churnTiers ?? mock.churnByTier;
    const pricingBenchmarks = results.pricingBenchmarks ?? mock.pricingBenchmarks;

    const recommendationStats = results.recommendInfo
      ? {
          catalog_size: results.recommendInfo.catalog_size ?? 50000,
          model_loaded: results.recommendInfo.model_loaded ?? false,
          metrics: results.recommendInfo.metrics ?? {},
          trained_at: results.recommendInfo.trained_at ?? ''
        }
      : mock.recommendationStats;

    const sentiment = results.sentimentInfo
      ? { ...mock.sentiment!, accuracy: results.sentimentInfo.metrics?.accuracy ?? 0.9668 }
      : mock.sentiment;

    return {
      forecast,
      salesSummary,
      fraudAlerts: mock.fraudAlerts,
      sentiment,
      churnByTier,
      pricingBenchmarks,
      recommendationStats,
      isLive: true,
      lastUpdated: new Date()
    };
  }
}
