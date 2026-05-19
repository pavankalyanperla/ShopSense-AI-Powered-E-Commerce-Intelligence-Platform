from pydantic import BaseModel, Field
from typing import Optional


class RecommendedProduct(BaseModel):
    product_id: str
    name: str
    category: str
    discounted_price: float
    actual_price: float
    rating: float
    rating_count: int
    img_link: str
    score: float = Field(description="Predicted rating score (1-5)")
    reason: str = Field(description="Why this was recommended")
    model_config = {"protected_namespaces": ()}


class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = Field(default=10, ge=1, le=50)
    category_filter: Optional[str] = None
    exclude_product_ids: list[str] = []
    model_config = {"protected_namespaces": ()}


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[RecommendedProduct]
    total: int
    strategy: str
    cached: bool = False
    model_version: str = "1.0.0"
    model_config = {"protected_namespaces": ()}


class SimilarProductsResponse(BaseModel):
    product_id: str
    similar_products: list[RecommendedProduct]
    total: int
    model_config = {"protected_namespaces": ()}


class PopularProductsResponse(BaseModel):
    products: list[RecommendedProduct]
    total: int
    category: Optional[str] = None
    model_config = {"protected_namespaces": ()}


class ModelInfoResponse(BaseModel):
    model_type: str
    trained_at: Optional[str]
    catalog_size: int
    metrics: Optional[dict]
    model_loaded: bool
    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    service: str
    status: str
    model_loaded: bool
    catalog_size: int
    redis_connected: bool
    model_config = {"protected_namespaces": ()}
