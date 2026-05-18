from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FraudPredictionRequest(BaseModel):
    transaction_amount: float = Field(..., gt=0, description="Order total in INR")
    payment_method: str = Field(..., description="COD, UPI, DebitCard, etc.")
    product_category: str = Field(default="Electronics", description="Primary product category")
    quantity: int = Field(default=1, ge=1, description="Total items in order")
    customer_age: int = Field(default=30, ge=18, le=100, description="Customer age in years")
    account_age_days: int = Field(default=365, ge=0, description="Days since account creation")
    transaction_hour: int = Field(default=12, ge=0, le=23, description="Hour of transaction (0-23 IST)")
    device_used: str = Field(default="Mobile", description="Mobile, Desktop, or Tablet")

    class Config:
        json_schema_extra = {
            "example": {
                "transaction_amount": 45999,
                "payment_method": "Credit Card",
                "product_category": "Electronics",
                "quantity": 1,
                "customer_age": 28,
                "account_age_days": 180,
                "transaction_hour": 14,
                "device_used": "Mobile"
            }
        }


class FraudPredictionResponse(BaseModel):
    fraud_probability: float = Field(description="Probability of fraud (0.0 - 1.0)")
    is_fraud: bool = Field(description="True if probability > threshold")
    risk_level: RiskLevel = Field(description="LOW / MEDIUM / HIGH / CRITICAL")
    risk_score: int = Field(description="Risk score 0-100")
    threshold_used: float = Field(description="Decision threshold (default 0.75)")
    top_risk_factors: list[str] = Field(description="Human-readable risk factors")
    recommendation: str = Field(description="Action recommendation for OrderService")
    model_version: str = Field(default="1.0.0")


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    features: list[str]
    fraud_threshold: float
    metrics: Optional[dict]
    model_loaded: bool


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool
    model_version: str
