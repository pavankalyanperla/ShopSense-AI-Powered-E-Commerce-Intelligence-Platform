"""
ShopSense PricingService
Gradient Boosting dynamic price optimization.
Port: 8006
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.schemas import (
    PricePredictionRequest,
    PricePredictionResponse,
    CategoryBenchmark,
    PricingInsightsResponse,
    ModelInfoResponse,
    HealthResponse
)
from app.model import pricing_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    status = "loaded" if pricing_model.model_loaded else "NOT LOADED -- run python app/train.py"
    cats = len(pricing_model.category_stats)
    print(f"PricingService started -- model: {status} | categories: {cats}")
    yield
    print("PricingService shutting down")


app = FastAPI(
    title="ShopSense PricingService",
    description=(
        "Gradient Boosting Regression for dynamic price optimization. "
        "Trained on Amazon India sales data. Provides optimal pricing "
        "recommendations for sellers."
    ),
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        service="PricingService",
        status="healthy",
        model_loaded=pricing_model.model_loaded,
        categories_available=len(pricing_model.category_stats)
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return pricing_model.get_info()


@app.post(
    "/predict/price",
    response_model=PricePredictionResponse,
    summary="Get optimal price recommendation"
)
async def predict_price(request: PricePredictionRequest):
    """
    Get dynamic price recommendation for a product.
    Returns optimal price, discount suggestion, competitive position, and pricing insights.
    Called by Seller Portal AI Listing Coach.
    """
    return pricing_model.predict(request)


@app.post(
    "/predict/price/batch",
    response_model=list[PricePredictionResponse],
    summary="Batch price predictions"
)
async def predict_batch(requests: list[PricePredictionRequest]):
    """Batch price predictions (max 50)."""
    if len(requests) > 50:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 50")
    return [pricing_model.predict(req) for req in requests]


@app.get(
    "/pricing/category-benchmarks",
    response_model=list[CategoryBenchmark],
    summary="Get price benchmarks by category"
)
async def category_benchmarks(limit: int = Query(default=20, ge=1, le=50)):
    """
    Get price benchmarks for all categories.
    Used by Admin Dashboard and Seller Portal AI Listing Coach.
    """
    return pricing_model.get_category_benchmarks(limit=limit)


@app.get(
    "/pricing/insights",
    response_model=PricingInsightsResponse,
    summary="Get platform-wide pricing insights"
)
async def pricing_insights():
    """
    Get platform-wide pricing insights including seasonal patterns,
    city-tier effects, and pricing tips for sellers.
    """
    return pricing_model.get_insights()


@app.get(
    "/pricing/category/{category}",
    response_model=CategoryBenchmark,
    summary="Get price benchmark for one category"
)
async def category_benchmark(category: str):
    """Get price benchmark for a specific category."""
    benchmarks = pricing_model.get_category_benchmarks(limit=100)
    for b in benchmarks:
        if category.lower() in b.category.lower():
            return b
    raise HTTPException(status_code=404, detail=f"Category '{category}' not found")


@app.get(
    "/predict/price/test",
    response_model=PricePredictionResponse,
    summary="Test with sample product"
)
async def test_prediction():
    """Test endpoint with sample product."""
    test_req = PricePredictionRequest(
        product_id="TEST001",
        category="Set",
        current_price=799,
        quantity_available=25,
        ship_state="MAHARASHTRA",
        day_of_week=4,
        month=10,
        is_weekend=0,
        is_month_end=0
    )
    return pricing_model.predict(test_req)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8006, reload=True)
