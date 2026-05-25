"""
ShopSense ChurnService
XGBoost customer churn prediction with
India-specific CityTier analysis.
Port: 8005
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.schemas import (
    ChurnPredictionRequest,
    ChurnPredictionResponse,
    CityTierAnalysis,
    ModelInfoResponse,
    HealthResponse
)
from app.model import churn_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    status = "loaded" if churn_model.model_loaded else "NOT LOADED — run python app/train.py"
    print(f"ChurnService started — model: {status}")
    yield
    print("ChurnService shutting down")


app = FastAPI(
    title="ShopSense ChurnService",
    description=(
        "XGBoost customer churn prediction with "
        "India-specific CityTier (Tier 1/2/3 city) analysis. "
        "Trained on real e-commerce customer data."
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
        service="ChurnService",
        status="healthy",
        model_loaded=churn_model.model_loaded
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return churn_model.get_info()


@app.post(
    "/predict/churn",
    response_model=ChurnPredictionResponse,
    summary="Predict churn probability for a customer"
)
async def predict_churn(request: ChurnPredictionRequest):
    """
    Predict whether a customer will churn.
    Returns probability, risk level, top risk factors,
    and personalised retention suggestions.
    """
    return churn_model.predict(request)


@app.post(
    "/predict/churn/batch",
    response_model=list[ChurnPredictionResponse],
    summary="Batch churn prediction"
)
async def predict_batch(requests: list[ChurnPredictionRequest]):
    """Batch churn prediction (max 100)."""
    if len(requests) > 100:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 100")
    return [churn_model.predict(req) for req in requests]


@app.get(
    "/churn/citytier-analysis",
    response_model=list[CityTierAnalysis],
    summary="Get churn analysis by CityTier"
)
async def citytier_analysis():
    """
    Get churn rates and characteristics broken down by India CityTier
    (Tier 1/2/3 cities). Used by Admin Intelligence Dashboard for the churn heatmap.
    """
    return churn_model.get_citytier_analysis()


@app.get("/churn/risk-segments", summary="Get customer risk segment summary")
async def risk_segments():
    """Get high-level risk segment breakdown. Used by Admin Dashboard KPI cards."""
    if not churn_model.metadata:
        return {"segments": []}

    citytier = churn_model.metadata.get('citytier_analysis', {})
    metrics = churn_model.metadata.get('metrics', {})

    return {
        "model_roc_auc": metrics.get('roc_auc', 0),
        "model_f1": metrics.get('f1_score', 0),
        "overall_churn_rate": 0.168,
        "citytier_breakdown": citytier,
        "high_risk_indicators": [
            "Complaint raised in last 30 days",
            "Satisfaction score ≤ 2",
            "No order in last 15+ days",
            "Tenure < 3 months",
            "Only 1 order placed"
        ],
        "retention_effectiveness": {
            "cashback_offer": "Reduces churn by ~15%",
            "complaint_resolution": "Reduces churn by ~25%",
            "personalized_discount": "Reduces churn by ~12%"
        }
    }


@app.get(
    "/predict/churn/test/high-risk",
    response_model=ChurnPredictionResponse,
    summary="Test with high-risk customer"
)
async def test_high_risk():
    """Test with a known high-risk customer profile."""
    test_req = ChurnPredictionRequest(
        customer_id="TEST_HIGH_RISK",
        tenure=1,
        city_tier=1,
        satisfaction_score=1,
        complain=1,
        day_since_last_order=25,
        cashback_amount=20,
        order_count=1,
        hour_spend_on_app=1,
        number_of_device_registered=5,
        preferred_payment_mode="COD",
        preferred_order_cat="Mobile Phone",
        warehouse_to_home=30,
        order_amount_hike=0,
        coupon_used=0,
        number_of_address=1,
        gender="Male",
        marital_status="Single",
        preferred_login_device="Mobile Phone"
    )
    return churn_model.predict(test_req)


@app.get(
    "/predict/churn/test/low-risk",
    response_model=ChurnPredictionResponse,
    summary="Test with low-risk customer"
)
async def test_low_risk():
    """Test with a known low-risk customer profile."""
    test_req = ChurnPredictionRequest(
        customer_id="TEST_LOW_RISK",
        tenure=24,
        city_tier=2,
        satisfaction_score=5,
        complain=0,
        day_since_last_order=3,
        cashback_amount=300,
        order_count=8,
        hour_spend_on_app=4,
        number_of_device_registered=2,
        preferred_payment_mode="UPI",
        preferred_order_cat="Grocery",
        warehouse_to_home=10,
        order_amount_hike=20,
        coupon_used=3,
        number_of_address=3,
        gender="Female",
        marital_status="Married",
        preferred_login_device="Mobile Phone"
    )
    return churn_model.predict(test_req)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005, reload=True)
