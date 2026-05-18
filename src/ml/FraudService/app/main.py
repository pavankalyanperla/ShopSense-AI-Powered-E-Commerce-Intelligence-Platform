"""
ShopSense FraudService
XGBoost-powered fraud detection for e-commerce transactions.
Port: 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.schemas import (
    FraudPredictionRequest,
    FraudPredictionResponse,
    ModelInfoResponse,
    HealthResponse
)
from app.model import fraud_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    status = "loaded" if fraud_model.model_loaded else "NOT LOADED — run python app/train.py"
    print(f"FraudService started — model: {status}")
    yield
    print("FraudService shutting down")


app = FastAPI(
    title="ShopSense FraudService",
    description=(
        "XGBoost-powered fraud detection for Indian e-commerce transactions. "
        "Trained on 1.4M+ real transaction records."
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
        service="FraudService",
        status="healthy",
        model_loaded=fraud_model.model_loaded,
        model_version="1.0.0" if fraud_model.model_loaded else "not-trained"
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return fraud_model.get_info()


@app.post(
    "/predict/fraud",
    response_model=FraudPredictionResponse,
    summary="Predict fraud probability for a transaction",
    description=(
        "Accepts transaction details and returns fraud probability (0-1), "
        "risk level, and recommendation. Called by OrderService on every checkout."
    )
)
async def predict_fraud(request: FraudPredictionRequest):
    result = fraud_model.predict(request)
    return result


@app.post(
    "/predict/fraud/batch",
    response_model=list[FraudPredictionResponse],
    summary="Batch fraud prediction"
)
async def predict_fraud_batch(requests: list[FraudPredictionRequest]):
    if len(requests) > 100:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 100")
    return [fraud_model.predict(req) for req in requests]


@app.get(
    "/predict/fraud/test",
    response_model=FraudPredictionResponse,
    summary="Test with a sample high-risk transaction"
)
async def test_prediction():
    test_request = FraudPredictionRequest(
        transaction_amount=95000,
        payment_method="Credit Card",
        product_category="Electronics",
        quantity=8,
        customer_age=19,
        account_age_days=3,
        transaction_hour=2,
        device_used="Mobile"
    )
    return fraud_model.predict(test_request)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
