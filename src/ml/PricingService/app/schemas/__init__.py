from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PricingStrategy(str, Enum):
    COMPETITIVE = "COMPETITIVE"
    PREMIUM = "PREMIUM"
    PENETRATION = "PENETRATION"
    DYNAMIC = "DYNAMIC"


class PricePredictionRequest(BaseModel):
    product_id: str = Field(description="ShopSense product ID")
    category: str = Field(description="Product category")
    current_price: float = Field(gt=0, description="Current price in INR")
    quantity_available: int = Field(default=50, ge=0, description="Stock available")
    ship_state: str = Field(default="MAHARASHTRA", description="Target state (uppercase)")
    day_of_week: int = Field(default=2, ge=0, le=6, description="0=Monday ... 6=Sunday")
    month: int = Field(default=6, ge=1, le=12, description="Month (1-12)")
    is_weekend: int = Field(default=0, ge=0, le=1)
    is_month_end: int = Field(default=0, ge=0, le=1, description="1 if last week of month")

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": "PROD001",
                "category": "Set",
                "current_price": 999,
                "quantity_available": 50,
                "ship_state": "MAHARASHTRA",
                "day_of_week": 4,
                "month": 10,
                "is_weekend": 0,
                "is_month_end": 0
            }
        }
    }


class PricePredictionResponse(BaseModel):
    product_id: str
    category: str
    current_price: float
    predicted_optimal_price: float
    price_difference: float
    price_difference_pct: float
    recommendation: str
    strategy: PricingStrategy
    discount_suggested: bool
    suggested_discount_pct: float
    category_avg_price: float
    category_median_price: float
    competitive_position: str
    insights: list[str]
    model_version: str = "1.0.0"

    model_config = {"protected_namespaces": ()}


class CategoryBenchmark(BaseModel):
    category: str
    avg_price: float
    median_price: float
    min_price: float
    max_price: float
    std_price: float
    order_count: int
    price_range_label: str

    model_config = {"protected_namespaces": ()}


class PricingInsightsResponse(BaseModel):
    total_categories: int
    highest_avg_category: str
    lowest_avg_category: str
    overall_avg_price: float
    weekend_price_premium: str
    month_end_effect: str
    top_revenue_states: list[str]
    pricing_tips: list[str]

    model_config = {"protected_namespaces": ()}


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    dataset: str
    metrics: Optional[dict]
    model_loaded: bool
    categories_available: int

    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool
    categories_available: int

    model_config = {"protected_namespaces": ()}
