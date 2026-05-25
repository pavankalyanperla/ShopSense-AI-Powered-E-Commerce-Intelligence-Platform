"""
PricingService model loader and predictor.
Gradient Boosting Regression for dynamic pricing.
"""

import joblib
import json
import os
import numpy as np
from typing import Optional

from app.schemas import (
    PricePredictionRequest,
    PricePredictionResponse,
    PricingStrategy,
    CategoryBenchmark,
    PricingInsightsResponse,
    ModelInfoResponse
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

FEATURE_ORDER = [
    'Category',
    'ship-state',
    'Qty',
    'day_of_week',
    'month',
    'is_weekend',
    'is_month_end',
    'category_avg_price',
    'category_median_price',
    'state_avg_price'
]


class PricingModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders: dict = {}
        self.category_stats: dict = {}
        self.metadata: Optional[dict] = None
        self.model_loaded = False
        self._load()

    def _load(self):
        paths = {
            'model': os.path.join(MODEL_DIR, 'pricing_model.pkl'),
            'scaler': os.path.join(MODEL_DIR, 'scaler.pkl'),
            'encoders': os.path.join(MODEL_DIR, 'label_encoders.pkl'),
            'cat_stats': os.path.join(MODEL_DIR, 'category_stats.pkl'),
            'meta': os.path.join(MODEL_DIR, 'model_metadata.json')
        }

        if not os.path.exists(paths['model']):
            print("Pricing model not found. Run: python app/train.py")
            return

        try:
            self.model = joblib.load(paths['model'])
            self.scaler = joblib.load(paths['scaler'])
            self.encoders = joblib.load(paths['encoders'])
            self.category_stats = joblib.load(paths['cat_stats'])

            if os.path.exists(paths['meta']):
                with open(paths['meta']) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            cats = len(self.category_stats)
            trained = self.metadata.get('trained_at', '')[:19] if self.metadata else ''
            print(f"PricingModel loaded -- {cats} categories, trained: {trained}")
        except Exception as e:
            print(f"Failed to load model: {e}")

    def _get_cat_stats(self, category: str) -> tuple[float, float, float]:
        if category in self.category_stats:
            stats = self.category_stats[category]
            return stats['avg_price'], stats['median_price'], stats['avg_price']

        cat_lower = category.lower()
        for key, stats in self.category_stats.items():
            if cat_lower in key.lower() or key.lower() in cat_lower:
                return stats['avg_price'], stats['median_price'], stats['avg_price']

        if self.category_stats:
            avg = float(np.mean([s['avg_price'] for s in self.category_stats.values()]))
            return avg, avg, avg

        return 500.0, 500.0, 500.0

    def _encode_value(self, feature: str, value: str) -> int:
        encoder = self.encoders.get(feature)
        if encoder:
            try:
                return int(encoder.transform([str(value)])[0])
            except ValueError:
                return 0
        return 0

    def predict(self, request: PricePredictionRequest) -> PricePredictionResponse:
        cat_avg, cat_median, state_avg = self._get_cat_stats(request.category)

        if not self.model_loaded:
            return self._rule_based_pricing(request, cat_avg, cat_median)

        try:
            feature_names = (
                self.metadata.get('feature_names', FEATURE_ORDER)
                if self.metadata else FEATURE_ORDER
            )

            values = []
            for feat in feature_names:
                if feat == 'Category':
                    values.append(float(self._encode_value('Category', request.category)))
                elif feat == 'ship-state':
                    values.append(float(self._encode_value('ship-state', request.ship_state)))
                elif feat == 'Qty':
                    values.append(float(request.quantity_available))
                elif feat == 'day_of_week':
                    values.append(float(request.day_of_week))
                elif feat == 'month':
                    values.append(float(request.month))
                elif feat == 'is_weekend':
                    values.append(float(request.is_weekend))
                elif feat == 'is_month_end':
                    values.append(float(request.is_month_end))
                elif feat == 'category_avg_price':
                    values.append(float(cat_avg))
                elif feat == 'category_median_price':
                    values.append(float(cat_median))
                elif feat == 'state_avg_price':
                    values.append(float(state_avg))
                else:
                    values.append(0.0)

            features = np.array(values).reshape(1, -1)
            features_scaled = self.scaler.transform(features)

            pred_log = self.model.predict(features_scaled)[0]
            optimal_price = float(np.expm1(pred_log))
            optimal_price = max(optimal_price, request.current_price * 0.3)

            return self._build_response(request, optimal_price, cat_avg, cat_median)

        except Exception as e:
            print(f"Prediction error: {e}")
            return self._rule_based_pricing(request, cat_avg, cat_median)

    def _build_response(
        self,
        request: PricePredictionRequest,
        optimal_price: float,
        cat_avg: float,
        cat_median: float
    ) -> PricePredictionResponse:
        diff = optimal_price - request.current_price
        diff_pct = (diff / request.current_price) * 100

        if optimal_price > cat_avg * 1.2:
            strategy = PricingStrategy.PREMIUM
        elif optimal_price < cat_avg * 0.8:
            strategy = PricingStrategy.PENETRATION
        elif abs(diff_pct) <= 5:
            strategy = PricingStrategy.COMPETITIVE
        else:
            strategy = PricingStrategy.DYNAMIC

        discount_suggested = optimal_price < request.current_price and diff_pct < -5
        discount_pct = max(0, -diff_pct) if discount_suggested else 0

        if request.current_price < cat_avg * 0.8:
            position = "Below Market -- opportunity to increase price"
        elif request.current_price > cat_avg * 1.2:
            position = "Above Market -- consider discount to boost sales"
        else:
            position = "Competitive -- within market range"

        if diff_pct > 10:
            rec = (f"Increase price by Rs.{abs(diff):.0f} "
                   f"({abs(diff_pct):.1f}%) -- demand supports higher price")
        elif diff_pct < -10:
            rec = (f"Reduce price by Rs.{abs(diff):.0f} "
                   f"({abs(diff_pct):.1f}%) -- competitive adjustment needed")
        else:
            rec = "Current price is optimal -- maintain pricing strategy"

        insights = []
        if request.is_weekend:
            insights.append(
                "Weekend pricing: customers spend more on weekends -- consider +5% uplift")
        if request.is_month_end:
            insights.append(
                "Month-end effect: salary credit drives higher spend -- good time to list premium")
        if request.month in [10, 11]:
            insights.append(
                "Festive season (Oct-Nov): Diwali demand surge -- maintain competitive price")
        if request.month == 1:
            insights.append("Post-festive season: consider clearance pricing")
        if not insights:
            pos_word = 'above' if request.current_price > cat_avg else 'below'
            insights.append(
                f"Category avg Rs.{cat_avg:.0f} -- your price is {pos_word} average")

        return PricePredictionResponse(
            product_id=request.product_id,
            category=request.category,
            current_price=request.current_price,
            predicted_optimal_price=round(optimal_price, 2),
            price_difference=round(diff, 2),
            price_difference_pct=round(diff_pct, 1),
            recommendation=rec,
            strategy=strategy,
            discount_suggested=discount_suggested,
            suggested_discount_pct=round(discount_pct, 1),
            category_avg_price=round(cat_avg, 2),
            category_median_price=round(cat_median, 2),
            competitive_position=position,
            insights=insights
        )

    def _rule_based_pricing(
        self,
        request: PricePredictionRequest,
        cat_avg: float,
        cat_median: float
    ) -> PricePredictionResponse:
        optimal = cat_median if cat_median > 0 else request.current_price

        if request.is_weekend:
            optimal *= 1.05
        if request.is_month_end:
            optimal *= 1.08

        return self._build_response(request, optimal, cat_avg, cat_median)

    def get_category_benchmarks(self, limit: int = 20) -> list[CategoryBenchmark]:
        results = []
        sorted_cats = sorted(
            self.category_stats.items(),
            key=lambda x: x[1]['order_count'],
            reverse=True
        )[:limit]

        for cat, stats in sorted_cats:
            avg = stats['avg_price']
            if avg < 500:
                label = "Budget (< Rs.500)"
            elif avg < 2000:
                label = "Mid-range (Rs.500-2K)"
            elif avg < 10000:
                label = "Premium (Rs.2K-10K)"
            else:
                label = "Luxury (> Rs.10K)"

            results.append(CategoryBenchmark(
                category=cat,
                avg_price=stats['avg_price'],
                median_price=stats['median_price'],
                min_price=stats['min_price'],
                max_price=stats['max_price'],
                std_price=stats['std_price'],
                order_count=stats['order_count'],
                price_range_label=label
            ))

        return results

    def get_insights(self) -> PricingInsightsResponse:
        if not self.category_stats:
            return PricingInsightsResponse(
                total_categories=0,
                highest_avg_category="N/A",
                lowest_avg_category="N/A",
                overall_avg_price=0,
                weekend_price_premium="+5%",
                month_end_effect="+8%",
                top_revenue_states=[],
                pricing_tips=[]
            )

        cats = self.category_stats
        sorted_by_avg = sorted(cats.items(), key=lambda x: x[1]['avg_price'])
        overall_avg = float(np.mean([s['avg_price'] for s in cats.values()]))

        return PricingInsightsResponse(
            total_categories=len(cats),
            highest_avg_category=sorted_by_avg[-1][0],
            lowest_avg_category=sorted_by_avg[0][0],
            overall_avg_price=round(overall_avg, 2),
            weekend_price_premium="+5%",
            month_end_effect="+8%",
            top_revenue_states=[
                "Maharashtra", "Karnataka",
                "Telangana", "Uttar Pradesh",
                "Tamil Nadu"
            ],
            pricing_tips=[
                "List products on Thursday-Friday for higher weekend visibility",
                "Apply festive pricing (Oct-Nov) for Diwali season -- demand +40%",
                "Tier 1 city customers pay 15% more on average -- consider city-based pricing",
                "Month-end (25th+) sees 8% higher average order value",
                "Free delivery above Rs.499 increases conversion by ~25%"
            ]
        )

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            model_type=(
                self.metadata.get('model_type', 'GradientBoostingRegressor')
                if self.metadata else 'GradientBoostingRegressor'
            ),
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            dataset=(
                self.metadata.get('dataset', 'Amazon India Sales')
                if self.metadata else 'Amazon India Sales'
            ),
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded,
            categories_available=len(self.category_stats)
        )


# Singleton
pricing_model = PricingModel()
