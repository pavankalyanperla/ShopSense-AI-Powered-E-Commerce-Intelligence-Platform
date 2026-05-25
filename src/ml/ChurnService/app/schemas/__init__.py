from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ChurnPredictionRequest(BaseModel):
    customer_id: str = Field(description="ShopSense customer ID")
    tenure: float = Field(default=12, ge=0, description="Months as customer")
    city_tier: int = Field(default=2, ge=1, le=3, description="1=Metro, 2=Mid-size, 3=Small")
    satisfaction_score: float = Field(default=3, ge=1, le=5, description="Satisfaction rating 1-5")
    complain: int = Field(default=0, ge=0, le=1, description="1 if raised complaint")
    day_since_last_order: float = Field(default=7, ge=0, description="Days since last order")
    cashback_amount: float = Field(default=150, ge=0, description="Total cashback received")
    order_count: float = Field(default=3, ge=0, description="Number of orders placed")
    hour_spend_on_app: float = Field(default=3, ge=0, description="Hours spent on app daily")
    number_of_device_registered: int = Field(default=3, ge=1, description="Devices registered")
    preferred_payment_mode: str = Field(default="UPI", description="COD/UPI/Debit Card/etc")
    preferred_order_cat: str = Field(default="Mobile Phone", description="Preferred product category")
    warehouse_to_home: float = Field(default=15, ge=0, description="Distance warehouse to home (km)")
    order_amount_hike: float = Field(default=15, ge=0, description="% increase in order amount")
    coupon_used: float = Field(default=1, ge=0, description="Number of coupons used")
    number_of_address: int = Field(default=2, ge=1, description="Number of saved addresses")
    gender: str = Field(default="Male", description="Male/Female")
    marital_status: str = Field(default="Single", description="Single/Married/Divorced")
    preferred_login_device: str = Field(default="Mobile Phone", description="Mobile Phone/Computer")

    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_id": "CUST001",
                "tenure": 6,
                "city_tier": 1,
                "satisfaction_score": 2,
                "complain": 1,
                "day_since_last_order": 20,
                "cashback_amount": 50,
                "order_count": 1,
                "hour_spend_on_app": 1,
                "number_of_device_registered": 5,
                "preferred_payment_mode": "COD",
                "preferred_order_cat": "Mobile Phone"
            }
        }
    }


class ChurnPredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    will_churn: bool
    risk_level: RiskLevel
    risk_score: int
    city_tier_label: str
    top_risk_factors: list[str]
    retention_suggestions: list[str]
    model_version: str = "1.0.0"

    model_config = {"protected_namespaces": ()}


class RiskSegment(BaseModel):
    segment: str
    customer_count: int
    avg_churn_probability: float
    common_characteristics: list[str]

    model_config = {"protected_namespaces": ()}


class CityTierAnalysis(BaseModel):
    tier: int
    label: str
    customer_count: int
    churn_rate: float
    avg_tenure_months: float
    avg_satisfaction: float
    avg_cashback: float
    avg_orders: float
    complain_rate: float
    risk_level: str

    model_config = {"protected_namespaces": ()}


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    dataset: str
    total_samples: int
    metrics: Optional[dict]
    model_loaded: bool
    citytier_analysis: Optional[dict]

    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool

    model_config = {"protected_namespaces": ()}
