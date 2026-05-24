from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SentimentLabel(str, Enum):
    POSITIVE = "POSITIVE"
    NEUTRAL = "NEUTRAL"
    NEGATIVE = "NEGATIVE"


class SentimentRequest(BaseModel):
    review_text: str = Field(
        ..., min_length=3,
        description="Review text to analyze")
    product_id: Optional[str] = Field(
        default=None,
        description="Product ID for context")

    model_config = {
        "json_schema_extra": {
            "example": {
                "review_text":
                    "Great product! Very fast delivery "
                    "and excellent quality. Highly recommended!",
                "product_id": "B001234"
            }
        }
    }


class SentimentResponse(BaseModel):
    sentiment: SentimentLabel
    confidence: float = Field(description="Confidence score 0.0-1.0")
    scores: dict = Field(description="Probability for each class")
    review_length: int
    model_version: str = "1.0.0"

    model_config = {"protected_namespaces": ()}


class BatchSentimentRequest(BaseModel):
    reviews: list[SentimentRequest] = Field(..., max_length=100)


class BatchSentimentResponse(BaseModel):
    results: list[SentimentResponse]
    total: int
    positive_count: int
    neutral_count: int
    negative_count: int
    average_confidence: float


class ProductSentimentSummary(BaseModel):
    product_id: str
    total_reviews: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    overall_sentiment: SentimentLabel
    avg_confidence: float


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    dataset: str
    classes: list[str]
    metrics: Optional[dict]
    model_loaded: bool
    vocabulary_size: int

    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool
    vocabulary_size: int

    model_config = {"protected_namespaces": ()}
