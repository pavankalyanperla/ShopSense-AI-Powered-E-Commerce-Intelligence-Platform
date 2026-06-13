"""PricingService API tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VALID_PRICE_REQUEST = {
    "product_id": "PROD_TEST_001",
    "category": "Electronics",
    "current_price": 999.0,
    "quantity_available": 50,
    "ship_state": "MAHARASHTRA",
    "day_of_week": 3,
    "month": 6,
    "is_weekend": 0,
    "is_month_end": 0
}


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "PricingService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_predict_price_valid():
    response = client.post("/predict/price", json=VALID_PRICE_REQUEST)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_optimal_price" in data
    assert "recommendation" in data
    assert data["predicted_optimal_price"] > 0


def test_predict_price_test_endpoint():
    response = client.get("/predict/price/test")
    assert response.status_code == 200


def test_category_benchmarks():
    response = client.get("/pricing/category-benchmarks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_pricing_insights():
    response = client.get("/pricing/insights")
    assert response.status_code == 200


def test_predict_batch_valid():
    response = client.post("/predict/price/batch", json=[VALID_PRICE_REQUEST, VALID_PRICE_REQUEST])
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_predict_batch_exceeds_limit():
    payload = [VALID_PRICE_REQUEST] * 51
    response = client.post("/predict/price/batch", json=payload)
    assert response.status_code == 400


def test_predict_price_zero_price_rejected():
    bad = {**VALID_PRICE_REQUEST, "current_price": 0}
    response = client.post("/predict/price", json=bad)
    assert response.status_code == 422


def test_category_benchmark_not_found():
    response = client.get("/pricing/category/ZZZNONONEXISTENT")
    assert response.status_code == 404
