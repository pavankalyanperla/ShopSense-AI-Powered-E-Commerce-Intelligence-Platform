# ShopSense SentimentService

TF-IDF + Logistic Regression sentiment analysis trained on 363,261 real Flipkart reviews.

## Overview

- **Model**: TF-IDF (50K features, bigrams) + Logistic Regression (multinomial, balanced)
- **Accuracy**: 0.9668 | **F1 weighted**: 0.9686
- **Classes**: POSITIVE / NEUTRAL / NEGATIVE
- **Port**: 8003
- **Called by**: ReviewService on every review submission

## Label Mapping

| Rating | Sentiment |
|---|---|
| 1-2 | NEGATIVE |
| 3   | NEUTRAL  |
| 4-5 | POSITIVE |

## Dataset

- **Source**: Flipkart Reviews dataset
- **Size**: 363,261 rows
- **File**: `data/flipkart_reviews.csv` (encoding: latin-1, git-ignored)
- **Distribution**: POSITIVE: 277K | NEGATIVE: 53K | NEUTRAL: 29K

## Model Performance

```
Accuracy     : 0.9668
F1 (macro)   : 0.9292
F1 (weighted): 0.9686

              precision  recall  f1-score
NEGATIVE       0.98      0.97    0.97
NEUTRAL        0.74      0.96    0.83
POSITIVE       1.00      0.97    0.98
```

## Training

```bash
cd src/ml/SentimentService
python -m app.train
```

Expected time: 3-5 minutes. Expected accuracy > 0.85.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET  | /health | Service health + model status |
| GET  | /model/info | Model metadata + metrics |
| POST | /analyze/sentiment | Analyze single review |
| POST | /analyze/sentiment/batch | Batch analysis (max 100) |
| POST | /analyze/product/{id} | Aggregated product sentiment |
| GET  | /analyze/sentiment/test | Sample positive review |
| GET  | /analyze/sentiment/test/negative | Sample negative review |

### Example Request

```bash
curl -X POST http://localhost:8003/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"review_text": "Absolutely loved this product! Fast delivery and great quality."}'
```

### Example Response

```json
{
  "sentiment": "POSITIVE",
  "confidence": 0.9987,
  "scores": {
    "NEGATIVE": 0.0005,
    "NEUTRAL": 0.0008,
    "POSITIVE": 0.9987
  },
  "review_length": 67,
  "model_version": "1.0.0"
}
```

## Resilience

- **Model not loaded**: rule-based fallback using positive/negative keyword lists
- **Empty text**: Pydantic `min_length=3` returns 422 validation error
- **Batch limit**: max 100 reviews per request (400 if exceeded)

## Docker

```bash
docker-compose build sentiment-service
docker-compose up -d sentiment-service
```

Model artifacts (`app/models/*.pkl`) are git-ignored but baked into the Docker image at build time.
