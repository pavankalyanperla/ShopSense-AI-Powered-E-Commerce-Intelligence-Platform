from pydantic import BaseModel, Field
from typing import Optional


class ForecastPoint(BaseModel):
    date: str
    predicted_revenue: float
    lower_bound: float
    upper_bound: float
    day_of_week: str
    is_weekend: bool

    model_config = {"protected_namespaces": ()}


class ForecastResponse(BaseModel):
    forecast_days: int
    start_date: str
    end_date: str
    total_predicted_revenue: float
    avg_daily_revenue: float
    peak_day: str
    peak_revenue: float
    forecast: list[ForecastPoint]
    category: Optional[str] = None
    model_version: str = "1.0.0"

    model_config = {"protected_namespaces": ()}


class SalesSummaryResponse(BaseModel):
    total_revenue: float
    total_orders: int
    avg_order_value: float
    avg_daily_revenue: float
    max_daily_revenue: float
    date_range: dict
    monthly_revenue: dict
    top_states: dict
    category_revenue: dict

    model_config = {"protected_namespaces": ()}


class CategoryForecastResponse(BaseModel):
    category: str
    forecast_days: int
    total_predicted_revenue: float
    avg_daily_revenue: float
    forecast: list[ForecastPoint]

    model_config = {"protected_namespaces": ()}


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    dataset: str
    last_training_date: Optional[str]
    categories_available: list[str]
    metrics: Optional[dict]
    model_loaded: bool

    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool
    categories_available: int

    model_config = {"protected_namespaces": ()}
