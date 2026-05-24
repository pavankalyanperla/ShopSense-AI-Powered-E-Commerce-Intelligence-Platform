"""
ShopSense ForecastingService
Facebook Prophet sales forecasting.
Port: 8004
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import uvicorn

from app.schemas import (
    ForecastResponse,
    SalesSummaryResponse,
    ModelInfoResponse,
    HealthResponse,
)
from app.model import forecasting_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    status = "loaded" if forecasting_model.model_loaded else "NOT LOADED -- run python -m app.train"
    cats = len(forecasting_model.category_models)
    print(f"ForecastingService started -- model: {status} | categories: {cats}", flush=True)
    yield
    print("ForecastingService shutting down", flush=True)


app = FastAPI(
    title="ShopSense ForecastingService",
    description=(
        "Facebook Prophet sales forecasting trained on Amazon India sales data. "
        "Provides 30/60/90-day revenue forecasts for the Admin Intelligence Dashboard."
    ),
    version="1.0.0",
    lifespan=lifespan,
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
        service="ForecastingService",
        status="healthy",
        model_loaded=forecasting_model.model_loaded,
        categories_available=len(forecasting_model.category_models),
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return forecasting_model.get_info()


@app.get(
    "/forecast/sales",
    response_model=ForecastResponse,
    summary="Get revenue forecast for next N days",
)
async def forecast_sales(
    days: int = Query(default=30, ge=7, le=180, description="Forecast horizon in days (7-180)")
):
    """
    Overall revenue forecast — called by Admin Dashboard for 30/60/90-day projections.
    """
    return forecasting_model.forecast_sales(days=days)


@app.get(
    "/forecast/category/{category}",
    response_model=ForecastResponse,
    summary="Get revenue forecast for a specific category",
)
async def forecast_category(
    category: str,
    days: int = Query(default=30, ge=7, le=180),
):
    """Category-specific forecast. Falls back to overall model if not available."""
    return forecasting_model.forecast_sales(days=days, category=category)


@app.get(
    "/forecast/weekly",
    response_model=ForecastResponse,
    summary="Get 7-day forecast",
)
async def forecast_weekly():
    return forecasting_model.forecast_sales(days=7)


@app.get(
    "/summary/sales",
    response_model=SalesSummaryResponse,
    summary="Get historical sales summary",
)
async def sales_summary():
    """Historical sales summary: monthly breakdown, top states, category revenue."""
    return forecasting_model.get_summary()


@app.get("/summary/states", summary="Get state-wise revenue breakdown")
async def state_summary():
    summary = forecasting_model.summary
    return {
        "top_states": summary.get('top_states', {}),
        "total_revenue": summary.get('total_revenue', 0),
    }


@app.get("/summary/categories", summary="Get category-wise revenue breakdown")
async def category_summary():
    summary = forecasting_model.summary
    return {
        "category_revenue": summary.get('category_revenue', {}),
        "categories_with_forecast_models": list(forecasting_model.category_models.keys()),
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8004, reload=True)
