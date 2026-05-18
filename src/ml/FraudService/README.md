# ShopSense FraudService

XGBoost-powered real-time fraud detection for e-commerce transactions.

## Overview

- **Model**: XGBoost classifier trained on 1.47M real Kaggle transactions
- **ROC-AUC**: 0.8052 (real-world Kaggle dataset, 5% fraud rate)
- **Fraud threshold**: 0.75 probability
- **Port**: 8001
- **Called by**: OrderService on every checkout

## Architecture

```
OrderService.CheckoutAsync()
    └── IFraudClient.CheckAsync()
            └── POST http://fraud-service:8001/predict/fraud
                    └── XGBoost model → FraudPredictionResponse
```

Orders with `fraud_probability >= 0.75` are saved as `OrderStatus.FraudHold`.
All orders receive a `FraudScore` field regardless of outcome.

## Dataset

- **Source**: Kaggle Fraudulent E-Commerce Transactions dataset
- **Size**: 1,472,952 rows
- **Fraud rate**: 5.01% (73,838 fraud / 1,399,114 legitimate)
- **File**: `data/fraud_transactions.csv` (374 MB, git-ignored)

## Features

| Feature | Type | Description |
|---|---|---|
| Transaction_Amount | Numerical | Transaction value in INR |
| Quantity | Numerical | Number of items |
| Customer_Age | Numerical | Customer age in years |
| Account_Age_Days | Numerical | Days since account creation |
| Transaction_Hour | Numerical | Hour of day (0-23) |
| Payment_Method | Categorical | PayPal / bank transfer / credit card / debit card |
| Product_Category | Categorical | clothing / electronics / health & beauty / home & garden / toys & games |
| Device_Used | Categorical | desktop / mobile / tablet |

## Model Performance

```
ROC-AUC:   0.8052
Precision: 0.7482  (at threshold 0.75)
Recall:    0.1570
F1 Score:  0.2595

Confusion Matrix (threshold=0.75):
  TN=279,043  FP=780
  FN=12,450   TP=2,318
```

## Risk Levels

| Probability | Risk Level |
|---|---|
| < 0.50 | LOW |
| 0.50 - 0.74 | MEDIUM |
| 0.75 - 0.89 | HIGH |
| >= 0.90 | CRITICAL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Service health + model_loaded status |
| GET | /model/info | Model metadata + feature importances |
| POST | /predict/fraud | Predict fraud for a single transaction |
| POST | /predict/fraud/batch | Batch predictions (max 100) |
| GET | /predict/fraud/test | Pre-set high-risk test transaction |

### Example Request

```bash
curl -X POST http://localhost:8001/predict/fraud \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_amount": 95000,
    "payment_method": "Credit Card",
    "product_category": "Electronics",
    "quantity": 8,
    "customer_age": 19,
    "account_age_days": 3,
    "transaction_hour": 2,
    "device_used": "Mobile"
  }'
```

### Example Response

```json
{
  "fraud_probability": 0.9868,
  "is_fraud": true,
  "risk_level": "CRITICAL",
  "risk_score": 98,
  "threshold_used": 0.75,
  "top_risk_factors": [
    "High transaction amount (Rs.95,000)",
    "New account (3 days old)",
    "Unusual transaction time (2:00)"
  ],
  "recommendation": "BLOCK - High fraud probability. Place order on FraudHold.",
  "model_version": "1.0.0"
}
```

## Training

Retrain on a new dataset:

```bash
cd src/ml/FraudService

# Place your CSV at data/fraud_transactions.csv
# Column names: Transaction Amount, Payment Method, Product Category,
#   Quantity, Customer Age, Device Used, Is Fraudulent,
#   Account Age Days, Transaction Hour

python app/train.py
```

Expected training time: 3-8 minutes for ~1.5M rows.

## Resilience

- OrderService is **fail-open**: if FraudService is unreachable or times out (3s), the order is placed normally with `FraudScore = 0`.
- The fallback rule-based engine activates when the ML model is not loaded.

## Docker

```bash
# Build (model artifacts are baked in)
docker-compose build fraud-service

# Start
docker-compose up -d fraud-service
```

Model artifacts (`app/models/*.pkl`) are git-ignored but baked into the Docker image at build time.
