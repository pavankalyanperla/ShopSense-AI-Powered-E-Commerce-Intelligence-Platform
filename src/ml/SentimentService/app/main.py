"""
ShopSense SentimentService
TF-IDF + Logistic Regression sentiment analysis.
Port: 8003
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import uvicorn

from app.schemas import (
    SentimentRequest,
    SentimentResponse,
    BatchSentimentRequest,
    BatchSentimentResponse,
    ProductSentimentSummary,
    ModelInfoResponse,
    HealthResponse,
)
from app.model import sentiment_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    status = "loaded" if sentiment_model.model_loaded else "NOT LOADED -- run python -m app.train"
    print(f"SentimentService started -- model: {status}", flush=True)
    yield
    print("SentimentService shutting down", flush=True)


app = FastAPI(
    title="ShopSense SentimentService",
    description=(
        "TF-IDF + Logistic Regression sentiment analysis "
        "trained on 363K real Flipkart reviews. "
        "Classifies reviews as POSITIVE / NEUTRAL / NEGATIVE."
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
    vocab_size = len(sentiment_model.vectorizer.vocabulary_) if sentiment_model.vectorizer else 0
    return HealthResponse(
        service="SentimentService",
        status="healthy",
        model_loaded=sentiment_model.model_loaded,
        vocabulary_size=vocab_size,
    )


@app.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    return sentiment_model.get_info()


@app.post(
    "/analyze/sentiment",
    response_model=SentimentResponse,
    summary="Analyze sentiment of a single review",
)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment of a single review.
    Called by ReviewService on every review submission.
    Returns POSITIVE / NEUTRAL / NEGATIVE with confidence score.
    """
    return sentiment_model.analyze(request)


@app.post(
    "/analyze/sentiment/batch",
    response_model=BatchSentimentResponse,
    summary="Analyze multiple reviews at once",
)
async def analyze_batch(request: BatchSentimentRequest):
    if len(request.reviews) > 100:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 100")
    return sentiment_model.analyze_batch(request.reviews)


@app.post(
    "/analyze/product/{product_id}",
    response_model=ProductSentimentSummary,
    summary="Get aggregated sentiment for a product",
)
async def product_sentiment(product_id: str, reviews: list[str]):
    if not reviews:
        raise HTTPException(status_code=400, detail="No reviews provided")
    return sentiment_model.get_product_summary(reviews, product_id)


@app.get(
    "/analyze/sentiment/test",
    response_model=SentimentResponse,
    summary="Test with sample positive review",
)
async def test_positive():
    test_req = SentimentRequest(
        review_text=(
            "Absolutely love this product! The quality is excellent and delivery "
            "was super fast. Highly recommend to everyone. Worth every rupee!"
        )
    )
    return sentiment_model.analyze(test_req)


@app.get(
    "/analyze/sentiment/test/negative",
    response_model=SentimentResponse,
    summary="Test with sample negative review",
)
async def test_negative():
    test_req = SentimentRequest(
        review_text=(
            "Terrible product! Completely waste of money. Stopped working after 2 days. "
            "Very disappointed with the quality. Do not buy this."
        )
    )
    return sentiment_model.analyze(test_req)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8003, reload=True)
