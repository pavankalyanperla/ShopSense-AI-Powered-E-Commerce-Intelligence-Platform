"""ForecastingService API tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "ForecastingService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_forecast_sales_default():
    response = client.get("/forecast/sales")
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert isinstance(data["forecast"], list)


def test_forecast_sales_30_days():
    response = client.get("/forecast/sales?days=30")
    assert response.status_code == 200


def test_forecast_sales_90_days():
    response = client.get("/forecast/sales?days=90")
    assert response.status_code == 200


def test_forecast_sales_below_min_days():
    # days < 7 should fail validation (ge=7)
    response = client.get("/forecast/sales?days=3")
    assert response.status_code == 422


def test_forecast_sales_above_max_days():
    # days > 180 should fail validation (le=180)
    response = client.get("/forecast/sales?days=200")
    assert response.status_code == 422


def test_forecast_weekly():
    response = client.get("/forecast/weekly")
    assert response.status_code == 200


def test_sales_summary():
    response = client.get("/summary/sales")
    assert response.status_code == 200


def test_state_summary():
    response = client.get("/summary/states")
    assert response.status_code == 200


def test_category_summary():
    response = client.get("/summary/categories")
    assert response.status_code == 200
