"""
ForecastingService model loader and predictor.
Holt-Winters Exponential Smoothing for sales forecasting.
"""

import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional

from app.schemas import (
    ForecastPoint,
    ForecastResponse,
    SalesSummaryResponse,
    CategoryForecastResponse,
    ModelInfoResponse,
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


class ForecastingModel:

    def __init__(self):
        self.model = None          # fitted HoltWintersResults
        self.resid_std: float = 0.0
        self.category_models: dict = {}   # cat name -> metadata dict
        self.summary: dict = {}
        self.metadata: Optional[dict] = None
        self.model_loaded = False
        self._load()

    def _load(self):
        model_path = os.path.join(MODEL_DIR, 'prophet_model.pkl')
        summary_path = os.path.join(MODEL_DIR, 'sales_summary.pkl')
        cat_path = os.path.join(MODEL_DIR, 'category_models.pkl')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if not os.path.exists(model_path):
            print("[ForecastingService] Model not found. Run: python -m app.train", flush=True)
            return

        try:
            payload = joblib.load(model_path)
            self.model = payload['model']
            self.resid_std = payload.get('resid_std', 0.0)

            if os.path.exists(summary_path):
                self.summary = joblib.load(summary_path)
            if os.path.exists(cat_path):
                self.category_models = joblib.load(cat_path)
            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    self.metadata = json.load(f)

            self.model_loaded = True
            cats = len(self.category_models)
            trained = self.metadata.get('trained_at', '')[:19] if self.metadata else ''
            print(f"[ForecastingService] Model loaded OK -- {cats} category models, trained: {trained}", flush=True)
        except Exception as e:
            print(f"[ForecastingService] ERROR loading model: {e}", flush=True)

    def _make_forecast_points(
        self,
        point_forecasts: np.ndarray,
        resid_std: float,
        days: int,
        category: Optional[str] = None,
    ) -> ForecastResponse:
        """Convert array of point forecasts into ForecastResponse with CI bands."""
        last_date = datetime.now()
        if self.metadata and self.metadata.get('last_training_date'):
            try:
                last_date = datetime.strptime(self.metadata['last_training_date'], '%Y-%m-%d')
            except Exception:
                pass

        points = []
        for i, rev in enumerate(point_forecasts):
            date = last_date + timedelta(days=i + 1)
            dow = date.weekday()
            rev = max(0.0, float(rev))
            # Prediction interval widens with horizon (random walk approximation)
            ci_half = 1.96 * resid_std * np.sqrt(i + 1)
            points.append(ForecastPoint(
                date=str(date.date()),
                predicted_revenue=round(rev, 2),
                lower_bound=round(max(0.0, rev - ci_half), 2),
                upper_bound=round(rev + ci_half, 2),
                day_of_week=DAYS_OF_WEEK[dow],
                is_weekend=dow >= 5,
            ))

        total = sum(p.predicted_revenue for p in points)
        avg = total / len(points) if points else 0.0
        peak = max(points, key=lambda p: p.predicted_revenue, default=None)

        return ForecastResponse(
            forecast_days=days,
            start_date=points[0].date if points else '',
            end_date=points[-1].date if points else '',
            total_predicted_revenue=round(total, 2),
            avg_daily_revenue=round(avg, 2),
            peak_day=peak.date if peak else '',
            peak_revenue=peak.predicted_revenue if peak else 0.0,
            forecast=points,
            category=category,
        )

    def forecast_sales(self, days: int = 30, category: Optional[str] = None) -> ForecastResponse:
        if not self.model_loaded:
            return self._synthetic_forecast(days, category)

        try:
            if category:
                cat_key = self._find_category(category)
                if cat_key:
                    slug = cat_key.lower().replace(' ', '_').replace('/', '_')
                    cat_pkl = os.path.join(MODEL_DIR, f'prophet_{slug}_model.pkl')
                    if os.path.exists(cat_pkl):
                        cat_model = joblib.load(cat_pkl)
                        cat_resid_std = self.category_models.get(cat_key, {}).get('resid_std', self.resid_std * 0.3)
                        forecasts = cat_model.forecast(days)
                        return self._make_forecast_points(forecasts.values, cat_resid_std, days, cat_key)

            forecasts = self.model.forecast(days)
            return self._make_forecast_points(forecasts.values, self.resid_std, days, category)

        except Exception as e:
            print(f"[ForecastingService] Forecast error: {e}", flush=True)
            return self._synthetic_forecast(days, category)

    def _find_category(self, category: str) -> Optional[str]:
        cat_lower = category.lower()
        for key in self.category_models.keys():
            if cat_lower in key.lower() or key.lower() in cat_lower:
                return key
        return None

    def _synthetic_forecast(self, days: int, category: Optional[str] = None) -> ForecastResponse:
        base = self.summary.get('avg_daily_revenue', 50000.0)
        np.random.seed(42)
        start = datetime.now() + timedelta(days=1)
        points = []
        for i in range(days):
            date = start + timedelta(days=i)
            dow = date.weekday()
            multiplier = 1.3 if dow >= 5 else 1.0
            trend = 1 + (i / days) * 0.05
            noise = np.random.normal(1, 0.1)
            rev = max(0.0, base * multiplier * trend * noise)
            points.append(ForecastPoint(
                date=str(date.date()),
                predicted_revenue=round(rev, 2),
                lower_bound=round(rev * 0.8, 2),
                upper_bound=round(rev * 1.2, 2),
                day_of_week=DAYS_OF_WEEK[dow],
                is_weekend=dow >= 5,
            ))

        total = sum(p.predicted_revenue for p in points)
        peak = max(points, key=lambda p: p.predicted_revenue)
        return ForecastResponse(
            forecast_days=days,
            start_date=points[0].date,
            end_date=points[-1].date,
            total_predicted_revenue=round(total, 2),
            avg_daily_revenue=round(total / len(points), 2),
            peak_day=peak.date,
            peak_revenue=peak.predicted_revenue,
            forecast=points,
            category=category,
            model_version="0.0.0-synthetic",
        )

    def get_summary(self) -> SalesSummaryResponse:
        s = self.summary
        return SalesSummaryResponse(
            total_revenue=s.get('total_revenue', 0.0),
            total_orders=s.get('total_orders', 0),
            avg_order_value=s.get('avg_order_value', 0.0),
            avg_daily_revenue=s.get('avg_daily_revenue', 0.0),
            max_daily_revenue=s.get('max_daily_revenue', 0.0),
            date_range=s.get('date_range', {}),
            monthly_revenue=s.get('monthly_revenue', {}),
            top_states=s.get('top_states', {}),
            category_revenue=s.get('category_revenue', {}),
        )

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            model_type=(self.metadata.get('model_type', 'Holt-Winters Exponential Smoothing')
                        if self.metadata else 'Holt-Winters Exponential Smoothing'),
            trained_at=self.metadata.get('trained_at') if self.metadata else None,
            dataset=(self.metadata.get('dataset', 'Amazon India Sales')
                     if self.metadata else 'Amazon India Sales'),
            last_training_date=self.metadata.get('last_training_date') if self.metadata else None,
            categories_available=(self.metadata.get('categories_trained', [])
                                   if self.metadata else []),
            metrics=self.metadata.get('metrics') if self.metadata else None,
            model_loaded=self.model_loaded,
        )


# Singleton
forecasting_model = ForecastingModel()
