"""RecommendationService API tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "RecommendationService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_recommend_returns_200():
    response = client.get("/recommend/user123")
    assert response.status_code == 200


def test_recommend_default_limit():
    data = client.get("/recommend/user123").json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)


def test_recommend_with_limit():
    response = client.get("/recommend/user123?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) <= 5


def test_popular_returns_200():
    response = client.get("/popular")
    assert response.status_code == 200


def test_popular_response_structure():
    data = client.get("/popular").json()
    assert "products" in data
    assert isinstance(data["products"], list)


def test_similar_missing_product_returns_404():
    response = client.get("/similar/PRODUCT_DOES_NOT_EXIST_XYZ123")
    assert response.status_code == 404


def test_invalidate_cache_returns_200():
    response = client.delete("/cache/user123")
    assert response.status_code == 200
