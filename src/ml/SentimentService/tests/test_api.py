"""SentimentService API tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_structure():
    data = client.get("/health").json()
    assert data["service"] == "SentimentService"
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_returns_200():
    response = client.get("/model/info")
    assert response.status_code == 200


def test_analyze_sentiment_valid():
    payload = {"review_text": "This product is absolutely amazing, great quality!"}
    response = client.post("/analyze/sentiment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "sentiment" in data
    assert data["sentiment"] in ("POSITIVE", "NEUTRAL", "NEGATIVE")
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0


def test_analyze_sentiment_negative_review():
    payload = {"review_text": "Terrible product, complete waste of money, broke after one day"}
    response = client.post("/analyze/sentiment", json=payload)
    assert response.status_code == 200


def test_analyze_sentiment_too_short():
    payload = {"review_text": "ok"}  # min_length=3 — exactly 2 chars fails
    response = client.post("/analyze/sentiment", json=payload)
    assert response.status_code == 422


def test_analyze_sentiment_test_endpoint():
    response = client.get("/analyze/sentiment/test")
    assert response.status_code == 200


def test_analyze_sentiment_test_negative_endpoint():
    response = client.get("/analyze/sentiment/test/negative")
    assert response.status_code == 200


def test_analyze_batch_valid():
    payload = {
        "reviews": [
            {"review_text": "Great product, very happy"},
            {"review_text": "Worst purchase ever, total junk"}
        ]
    }
    response = client.post("/analyze/sentiment/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 2


def test_analyze_batch_exceeds_limit():
    payload = {"reviews": [{"review_text": "Good product indeed"}] * 101}
    response = client.post("/analyze/sentiment/batch", json=payload)
    # Pydantic max_length=100 on reviews list returns 422; handler check returns 400
    assert response.status_code in (400, 422)
