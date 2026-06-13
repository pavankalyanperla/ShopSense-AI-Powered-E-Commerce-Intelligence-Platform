"""FraudService API tests — uses TestClient (no live server needed)."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "FraudService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_predict_fraud_valid_request():
    payload = {
        "transaction_amount": 5000,
        "payment_method": "UPI",
        "product_category": "Electronics",
        "quantity": 1,
        "customer_age": 30,
        "account_age_days": 365,
        "transaction_hour": 14,
        "device_used": "Mobile"
    }
    response = client.post("/predict/fraud", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fraud_probability" in data
    assert "risk_level" in data
    assert 0.0 <= data["fraud_probability"] <= 1.0


def test_predict_fraud_high_risk_profile():
    payload = {
        "transaction_amount": 95000,
        "payment_method": "Credit Card",
        "product_category": "Electronics",
        "quantity": 8,
        "customer_age": 19,
        "account_age_days": 3,
        "transaction_hour": 2,
        "device_used": "Mobile"
    }
    response = client.post("/predict/fraud", json=payload)
    assert response.status_code == 200


def test_predict_fraud_test_endpoint():
    response = client.get("/predict/fraud/test")
    assert response.status_code == 200


def test_predict_fraud_batch_valid():
    payload = [
        {"transaction_amount": 500, "payment_method": "UPI"},
        {"transaction_amount": 1200, "payment_method": "COD"}
    ]
    response = client.post("/predict/fraud/batch", json=payload)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 2


def test_predict_fraud_batch_exceeds_limit():
    payload = [{"transaction_amount": 500, "payment_method": "UPI"}] * 101
    response = client.post("/predict/fraud/batch", json=payload)
    assert response.status_code == 400


def test_predict_fraud_missing_required_field():
    # transaction_amount and payment_method are required
    response = client.post("/predict/fraud", json={"quantity": 1})
    assert response.status_code == 422
