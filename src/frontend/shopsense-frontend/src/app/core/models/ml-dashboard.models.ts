export interface ForecastPoint {
  date: string;
  predicted_revenue: number;
  lower_bound: number;
  upper_bound: number;
  day_of_week: string;
  is_weekend: boolean;
}

export interface ForecastResponse {
  forecast_days: number;
  start_date: string;
  end_date: string;
  total_predicted_revenue: number;
  avg_daily_revenue: number;
  peak_day: string;
  peak_revenue: number;
  forecast: ForecastPoint[];
}

export interface SalesSummaryResponse {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  avg_daily_revenue: number;
  max_daily_revenue: number;
  date_range: { start: string; end: string; days: number };
  monthly_revenue: Record<string, number>;
  top_states: Record<string, number>;
  category_revenue: Record<string, number>;
}

export interface FraudPredictionResponse {
  fraud_probability: number;
  is_fraud: boolean;
  risk_level: string;
  risk_score: number;
  top_risk_factors: string[];
  recommendation: string;
}

export interface FraudAlert {
  orderId: string;
  amount: number;
  paymentMethod: string;
  fraudScore: number;
  riskLevel: string;
  time: string;
  status: 'Hold' | 'Review' | 'Clear';
}

export interface SentimentSummary {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  totalReviews: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  accuracy: number;
}

export interface CityTierChurn {
  tier: number;
  label: string;
  churn_rate: number;
  avg_tenure_months: number;
  avg_satisfaction: number;
  risk_level: string;
  customer_count: number;
}

export interface CategoryBenchmark {
  category: string;
  avg_price: number;
  median_price: number;
  order_count: number;
  price_range_label: string;
}

export interface RecommendationStats {
  catalog_size: number;
  model_loaded: boolean;
  metrics: { rmse?: number };
  trained_at: string;
}

export interface DashboardData {
  forecast: ForecastResponse | null;
  salesSummary: SalesSummaryResponse | null;
  fraudAlerts: FraudAlert[];
  sentiment: SentimentSummary | null;
  churnByTier: CityTierChurn[];
  pricingBenchmarks: CategoryBenchmark[];
  recommendationStats: RecommendationStats | null;
  isLive: boolean;
  lastUpdated: Date;
}
