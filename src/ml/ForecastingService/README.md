# ShopSense ForecastingService

Holt-Winters Exponential Smoothing sales forecasting trained on 128,975 Amazon India orders.

## Overview

- **Model**: Holt-Winters Exponential Smoothing (multiplicative trend + multiplicative weekly seasonality)
- **MAPE**: 42.9% (within target for retail forecasting)
- **MAE**: Rs.117,414 per day | **RMSE**: Rs.180,242
- **Port**: 8004
- **Used by**: Admin Intelligence Dashboard (30/60/90-day revenue projections)

## Dataset

- **Source**: Amazon India Sales dataset
- **Size**: 128,975 rows, 24 columns
- **File**: `data/amazon_sales.csv` (encoding: latin-1, git-ignored)
- **Date range**: 2022-03-31 to 2022-06-29 (91 days)
- **Total revenue**: Rs.69,663,293 | **Avg order**: Rs.663
- **Filtered**: Shipped/Delivered orders only (cancelled excluded)

## Category Models (5 trained)

| Category | Avg Daily Revenue |
|---|---|
| Set | Top category |
| kurta | Top category |
| Western Dress | Top category |
| Top | Top category |
| Ethnic Dress | Top category |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Service health + model status |
| GET | /model/info | Model metadata + metrics |
| GET | /forecast/sales?days=N | Revenue forecast (7-180 days) |
| GET | /forecast/category/{category}?days=N | Category-specific forecast |
| GET | /forecast/weekly | 7-day quick forecast |
| GET | /summary/sales | Historical sales summary |
| GET | /summary/states | Top 10 states by revenue |
| GET | /summary/categories | Category revenue breakdown |

### Example Response

```json
{
  "forecast_days": 30,
  "start_date": "2022-06-30",
  "end_date": "2022-07-29",
  "total_predicted_revenue": 4286303.0,
  "avg_daily_revenue": 142876.77,
  "peak_day": "2022-07-03",
  "peak_revenue": 158190.4,
  "forecast": [
    {
      "date": "2022-06-30",
      "predicted_revenue": 158190.4,
      "lower_bound": 145000.0,
      "upper_bound": 171380.8,
      "day_of_week": "Thursday",
      "is_weekend": false
    }
  ]
}
```

## Training

```bash
cd src/ml/ForecastingService
python -m app.train
```

Expected time: < 1 minute. Expected MAPE < 50%.

## Resilience

- **Model not loaded**: synthetic fallback forecast with realistic noise and weekend boost
- **Unknown category**: falls back to overall model forecast
- **days=180**: returns 180 forecast points without timeout

## Docker

```bash
docker-compose build forecasting-service
docker-compose up -d forecasting-service
```

Model artifacts (`app/models/*.pkl`) are git-ignored but baked into the Docker image at build time.

## Note on Model Choice

Holt-Winters (statsmodels) was selected over Facebook Prophet because:
1. Pure Python — no C++ compiler (MinGW/CmdStan) required on Windows
2. Equivalent multiplicative seasonality support
3. Faster training (< 1 min vs 3-5 min)
4. Smaller Docker image (no Stan binary)
