"""ChurnService API tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VALID_CHURN_REQUEST = {
    "customer_id": "CUST_TEST_001",
    "tenure": 12,
    "city_tier": 2,
    "satisfaction_score": 3,
    "complain": 0,
    "day_since_last_order": 5,
    "cashback_amount": 150.0,
    "order_count": 4,
    "hour_spend_on_app": 3,
    "number_of_device_registered": 2,
    "preferred_payment_mode": "UPI",
    "preferred_order_cat": "Mobile",
    "warehouse_to_home": 15,
    "order_amount_hike": 15,
    "coupon_used": 2,
    "number_of_address": 2,
    "gender": "Male",
    "marital_status": "Married",
    "preferred_login_device": "Mobile Phone"
}


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "ChurnService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_predict_churn_valid():
    response = client.post("/predict/churn", json=VALID_CHURN_REQUEST)
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data
    assert "risk_level" in data
    assert 0.0 <= data["churn_probability"] <= 1.0


def test_predict_churn_high_risk_test():
    response = client.get("/predict/churn/test/high-risk")
    assert response.status_code == 200


def test_predict_churn_low_risk_test():
    response = client.get("/predict/churn/test/low-risk")
    assert response.status_code == 200


def test_citytier_analysis():
    response = client.get("/churn/citytier-analysis")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_risk_segments():
    response = client.get("/churn/risk-segments")
    assert response.status_code == 200


def test_predict_batch_valid():
    response = client.post("/predict/churn/batch", json=[VALID_CHURN_REQUEST, VALID_CHURN_REQUEST])
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_predict_batch_exceeds_limit():
    payload = [VALID_CHURN_REQUEST] * 101
    response = client.post("/predict/churn/batch", json=payload)
    assert response.status_code == 400
