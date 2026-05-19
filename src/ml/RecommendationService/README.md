# ShopSense RecommendationService

SVD collaborative filtering recommendations powered by Amazon India product data.

## Overview

- **Model**: SVD (scipy.sparse.linalg.svds) trained on 50,000 Amazon India products
- **Train RMSE**: 0.5252 | MAE: 0.4268
- **Strategy**: Collaborative filtering (known users) / Popularity fallback (cold-start)
- **Caching**: Redis with 30-minute TTL
- **Port**: 8002

## Architecture

```
GET /recommend/{user_id}
    ├── Known user  → SVD prediction (U * Sigma * Vt)
    └── New user    → Popular products fallback (rating × log(rating_count))

GET /similar/{product_id}
    └── Same category + price range + item-vector cosine similarity

GET /popular
    └── Sorted by popularity score (rating × log1p(rating_count))
```

## Dataset

- **Source**: Amazon India Products dataset (Kaggle)
- **File**: `data/amazon_products.csv` (git-ignored)
- **Used for training**: Top 50,000 products by review count

## Training

```bash
cd src/ml/RecommendationService

# Place your CSV at data/amazon_products.csv
python -m app.train
```

Expected training time: 1-3 minutes. Expected RMSE: 0.50-1.20.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Service health + model status |
| GET | /model/info | SVD model metadata + metrics |
| GET | /recommend/{user_id} | Personalized recommendations |
| GET | /similar/{product_id} | Similar products |
| GET | /popular | Trending products |
| DELETE | /cache/{user_id} | Invalidate user cache |

### Query parameters for /recommend/{user_id}

| Param | Default | Description |
|---|---|---|
| limit | 10 | Number of results (1-50) |
| category | — | Filter by category string |
| exclude | — | Comma-separated product IDs to exclude |

### Example Request

```bash
# Personalized
curl http://localhost:8002/recommend/U00001?limit=5

# Cold-start (new user)
curl http://localhost:8002/recommend/UNKNOWN_USER

# Popular in a category
curl "http://localhost:8002/popular?limit=5&category=Electronics"

# Similar products
curl http://localhost:8002/similar/B0012SNLJG
```

### Example Response

```json
{
  "user_id": "U00001",
  "recommendations": [
    {
      "product_id": "B0012SNLJG",
      "name": "Wilson NFL Super Grip Football",
      "category": "Sports",
      "discounted_price": 9351.0,
      "actual_price": 9351.0,
      "rating": 5.0,
      "rating_count": 18497,
      "img_link": "https://m.media-amazon.com/...",
      "score": 4.9213,
      "reason": "Recommended based on your taste"
    }
  ],
  "total": 1,
  "strategy": "svd-collaborative-filtering",
  "cached": false,
  "model_version": "1.0.0"
}
```

## Cold-Start Handling

Unknown users receive products ranked by `rating × log1p(rating_count)` — a popularity score that balances quality and volume. Strategy field is set to `"popular-cold-start"`.

## Redis Caching

Results are cached for 30 minutes (key: `rec:{user_id}:{limit}:{category}`). Use `DELETE /cache/{user_id}` to invalidate. Redis is optional — the service degrades gracefully without it.

## Docker

```bash
# Build (model artifacts are baked in from app/models/)
docker-compose build recommendation-service

# Start
docker-compose up -d recommendation-service
```

Model artifacts (`app/models/*.pkl`) are git-ignored but baked into the Docker image at build time.
