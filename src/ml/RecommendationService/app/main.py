from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.model import recommendation_model
from app.schemas import (
    RecommendationResponse,
    SimilarProductsResponse,
    PopularProductsResponse,
    ModelInfoResponse,
    HealthResponse,
)

app = FastAPI(
    title="ShopSense RecommendationService",
    version="1.0.0",
    description="SVD collaborative filtering recommendations powered by Amazon India product data",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        service="RecommendationService",
        status="healthy",
        model_loaded=recommendation_model.model_loaded,
        catalog_size=recommendation_model.catalog_size,
        redis_connected=recommendation_model.redis_connected,
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return recommendation_model.get_info()


@app.get("/recommend/{user_id}", response_model=RecommendationResponse)
async def recommend(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    category: Optional[str] = Query(default=None),
    exclude: Optional[str] = Query(default=None, description="Comma-separated product IDs to exclude"),
):
    exclude_ids = [x.strip() for x in exclude.split(',')] if exclude else []
    return recommendation_model.get_recommendations(
        user_id=user_id,
        limit=limit,
        category_filter=category,
        exclude_product_ids=exclude_ids,
    )


@app.get("/similar/{product_id}", response_model=SimilarProductsResponse)
async def similar_products(
    product_id: str,
    limit: int = Query(default=10, ge=1, le=50),
):
    result = recommendation_model.get_similar_products(product_id=product_id, limit=limit)
    if result.total == 0:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found in catalog")
    return result


@app.get("/popular", response_model=PopularProductsResponse)
async def popular_products(
    limit: int = Query(default=10, ge=1, le=50),
    category: Optional[str] = Query(default=None),
):
    return recommendation_model.get_popular(limit=limit, category=category)


@app.delete("/cache/{user_id}")
async def invalidate_cache(user_id: str):
    deleted = recommendation_model.invalidate_cache(user_id)
    return {"user_id": user_id, "keys_deleted": deleted, "message": f"Cache cleared for user {user_id}"}
