![CI](https://github.com/pavankalyanperla/ShopSense-Ecommerce/actions/workflows/ci.yml/badge.svg)
![Docker](https://github.com/pavankalyanperla/ShopSense-Ecommerce/actions/workflows/docker-build.yml/badge.svg)

# ShopSense — AI-Powered E-Commerce Intelligence Platform

Enterprise-grade e-commerce platform with 6 AI/ML microservices for fraud detection, product recommendations, sentiment analysis, sales forecasting, customer churn prediction, and dynamic pricing.
Built with Angular 21, ASP.NET Core 10, Python FastAPI, and Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, PrimeNG Aura, TypeScript |
| Backend | ASP.NET Core 10, Clean Architecture, Ocelot Gateway |
| ML/AI | Python FastAPI, XGBoost, TF-IDF, SVD, Holt-Winters, GBR |
| Database | SQL Server 2022, Redis 7, RabbitMQ 3 |
| DevOps | Docker Compose (17 containers), GitHub Actions CI/CD |
| Auth | JWT + BCrypt + OTP Email + Google OAuth + Redis Blacklisting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular 21 + PrimeNG                     │
│              Customer | Seller | Admin Portals              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  Ocelot Gateway │
                │   (Port 5000)   │
                └───────┬────────┘
           ┌────────────┼────────────┐
           │            │            │
    ┌──────▼──────┐ ┌───▼───────┐ ┌─▼────────┐
    │  Identity   │ │  Product  │ │  Order   │
    │   :5100     │ │   :5200   │ │  :5300   │
    └─────────────┘ └───────────┘ └──────────┘
    ┌─────────────┐ ┌───────────┐ ┌──────────┐
    │   Review    │ │  Seller   │ │ Notific. │
    │   :5400     │ │   :5500   │ │  :5600   │
    └─────────────┘ └───────────┘ └──────────┘
           │            │            │
    ┌──────▼────────────▼────────────▼──────┐
    │     SQL Server | Redis | RabbitMQ     │
    └───────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          Python FastAPI ML Services          │
│  Fraud    │ Recommend │ Sentiment │ Forecast │
│  :8001    │   :8002   │   :8003   │  :8004   │
│  Churn    │  Pricing  │           │          │
│  :8005    │   :8006   │           │          │
└──────────────────────────────────────────────┘
```

---

## ML Models

| Service | Algorithm | Dataset | Key Metric |
|---|---|---|---|
| FraudService | XGBoost + SMOTE | 1.47M Kaggle transactions | ROC-AUC: 0.8052 |
| RecommendationService | SVD (scipy) | 1.59M Amazon India products | RMSE: 0.5252 |
| SentimentService | TF-IDF + Logistic Regression | 363K Flipkart reviews | Accuracy: 0.9668 |
| ForecastingService | Holt-Winters Exponential Smoothing | 128K Amazon India orders | MAPE: 42.9% |
| ChurnService | XGBoost + SMOTE | 5,630 e-commerce customers | ROC-AUC: 0.9857 |
| PricingService | Gradient Boosting Regressor | 128K Amazon India orders | R²: 0.4689 |

---

## Features

### Customer Portal
- Product browsing with search, filters, and category navigation
- Shopping cart with quantity management
- Checkout with COD, UPI, Card, and NetBanking payment methods
- Coupon codes and discount system
- Product reviews and ratings
- Wishlist management
- Order tracking and history
- AI-powered product recommendations (SVD)

### Seller Portal
- KYC verification workflow with admin approval
- Product listing and inventory management
- AI Listing Coach — ML-powered product title and description suggestions
- Sales analytics dashboard
- Order fulfilment management

### Admin Portal
- Intelligence Dashboard powered by all 6 ML services
- User management (customers, sellers)
- Seller KYC approval and rejection
- Fraud monitoring with XGBoost risk scoring
- Coupon creation and management
- Review moderation

---

## Admin Intelligence Dashboard

A real-time analytics dashboard aggregating outputs from all 6 ML microservices:

- **KPI Cards** — revenue, active fraud alerts, churn risk, sentiment score, recommendation coverage, 30-day forecast
- **Revenue Forecast** — 30-day Holt-Winters prediction with weekend demand peaks visualised
- **India State Breakdown** — revenue distribution across 8 major states (Maharashtra, Karnataka, Delhi, Tamil Nadu, Gujarat, Rajasthan, West Bengal, Uttar Pradesh)
- **Fraud Alerts** — live feed with XGBoost risk scores, transaction amounts, and IP geolocation
- **Review Sentiment** — TF-IDF analysis: 78% positive, 12% neutral, 10% negative with donut chart
- **Churn Risk by CityTier** — Tier 1/2/3 Indian city segmentation using XGBoost with SMOTE balancing
- **Dynamic Pricing Benchmarks** — GBR-predicted vs actual prices across 5 product categories
- **Recommendation Engine Stats** — SVD matrix factorisation metrics, 50K+ products indexed

---

## Project Structure

```
ShopSense-Ecommerce/
├── src/
│   ├── backend/                     # .NET Microservices
│   │   ├── IdentityService.API/     # Auth + JWT + OTP + Google OAuth
│   │   ├── ProductService.API/      # Products + Categories + Wishlist
│   │   ├── OrderService.API/        # Cart + Checkout + Orders + Returns
│   │   ├── ReviewService.API/       # Product Reviews + Ratings
│   │   ├── SellerService.API/       # Seller KYC + Management
│   │   ├── NotificationService.API/ # Email Notifications via RabbitMQ
│   │   └── ApiGateway/              # Ocelot API Gateway
│   ├── frontend/
│   │   └── shopsense-frontend/      # Angular 21 + PrimeNG Aura
│   └── ml/                          # Python ML Services
│       ├── FraudService/            # XGBoost fraud detection
│       ├── RecommendationService/   # SVD product recommendations
│       ├── SentimentService/        # TF-IDF sentiment analysis
│       ├── ForecastingService/      # Holt-Winters sales forecasting
│       ├── ChurnService/            # XGBoost churn prediction
│       └── PricingService/          # GBR dynamic pricing
├── docker-compose.yml               # 17 containers
├── start-local.bat                  # One-click local startup (Windows)
├── stop-local.bat                   # One-click shutdown (Windows)
└── .env.example                     # Environment template
```

---

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/pavankalyanperla/ShopSense-Ecommerce.git
cd ShopSense-Ecommerce
cp .env.example .env
docker-compose up -d
# Wait 2 minutes for all 17 containers to start
# Open http://localhost:4200
```

### Local Development (Windows)

```bash
# Prerequisites: .NET 10 SDK, Python 3.11+, Node.js 20+, Docker Desktop

# Start infrastructure
docker-compose up -d sqlserver redis rabbitmq

# One-click start all services
start-local.bat

# Open http://localhost:4200
```

### Train ML Models

```bash
cd src/ml/FraudService && python app/train.py
cd src/ml/RecommendationService && python app/train.py
cd src/ml/SentimentService && python app/train.py
cd src/ml/ForecastingService && python app/train.py
cd src/ml/ChurnService && python app/train.py
cd src/ml/PricingService && python app/train.py
```

---

## API Endpoints

### Identity Service (via Gateway: `/api/v1/auth/...`)
| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login + JWT |
| POST | /auth/logout | Invalidate token |
| POST | /auth/refresh | Refresh JWT |
| POST | /auth/verify | Verify OTP |
| GET | /auth/google | Google OAuth initiation |

### Product Service (via Gateway: `/api/v1/products/...`)
| Method | Path | Description |
|---|---|---|
| GET | /products | List products (paginated) |
| GET | /products/{id} | Get product detail |
| POST | /products | Create product (Seller) |
| PUT | /products/{id} | Update product |
| GET | /categories | List categories |
| GET | /wishlist | Get wishlist |
| POST | /wishlist/{id} | Add to wishlist |

### Order Service (via Gateway: `/api/v1/orders/...`)
| Method | Path | Description |
|---|---|---|
| GET | /cart | Get cart |
| POST | /cart/add | Add to cart |
| PUT | /cart/update | Update quantity |
| POST | /orders/checkout | Place order |
| GET | /orders | List orders |
| GET | /orders/{id} | Order detail |

### ML Services (direct access)
| Method | Path | Service |
|---|---|---|
| POST | /predict | FraudService :8001 |
| GET | /recommend/{userId} | RecommendationService :8002 |
| POST | /analyze | SentimentService :8003 |
| GET | /forecast | ForecastingService :8004 |
| POST | /predict | ChurnService :8005 |
| POST | /predict | PricingService :8006 |
| GET | /health | All ML services |

---

## Port Reference

| Service | Port | Description |
|---|---|---|
| Angular Frontend | 4200 | Customer + Seller + Admin portals |
| API Gateway | 5000 | Ocelot reverse proxy |
| IdentityService | 5100 | Auth, JWT, OTP, Google OAuth |
| ProductService | 5200 | Products, categories, wishlist |
| OrderService | 5300 | Cart, checkout, orders, returns |
| ReviewService | 5400 | Product reviews |
| SellerService | 5500 | Seller KYC, management |
| NotificationService | 5600 | Email notifications (RabbitMQ) |
| FraudService | 8001 | XGBoost fraud detection |
| RecommendationService | 8002 | SVD product recommendations |
| SentimentService | 8003 | TF-IDF review sentiment |
| ForecastingService | 8004 | Holt-Winters sales forecast |
| ChurnService | 8005 | XGBoost churn prediction |
| PricingService | 8006 | GBR dynamic pricing |
| SQL Server | 1433 | Primary database |
| Redis | 6379 | Token blacklist + caching |
| RabbitMQ | 5672 / 15672 | Event bus + management UI |

---

## Datasets

| Dataset | Source | Size | Used By |
|---|---|---|---|
| Fraudulent E-Commerce Transactions | Kaggle (shriyashjagtap) | 1.47M rows | FraudService |
| Amazon India Products 2023 | Kaggle (asaniczka) | 1.59M products | RecommendationService |
| Flipkart Product Reviews | Kaggle | 363K reviews | SentimentService |
| Amazon India Sales | Kaggle (thedevastator) | 128K orders | ForecastingService, PricingService |
| E-Commerce Customer Churn | Kaggle (ankitverma2010) | 5,630 customers | ChurnService |

---

## Test Coverage

| Suite | Framework | Tests |
|---|---|---|
| IdentityService.Tests | NUnit + Moq | 26 |
| ProductService.Tests | NUnit + Moq | 26 |
| OrderService.Tests | NUnit + Moq | 29 |
| FraudService | pytest | 9 |
| RecommendationService | pytest | 10 |
| SentimentService | pytest | 10 |
| ForecastingService | pytest | 12 |
| ChurnService | pytest | 10 |
| PricingService | pytest | 11 |
| **Total** | | **143** |

```bash
dotnet test src/backend --verbosity normal   # 81 NUnit tests — 0 failures
cd src/ml/FraudService && python -m pytest tests/ -v   # 9 pytest tests
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | 8 architecture decisions, technology matrix, data flow |
| [API Reference](docs/API.md) | All endpoints with request/response examples |
| [Contributing](CONTRIBUTING.md) | Setup guide, branch strategy, PR process |
| [Portfolio Showcase](docs/showcase.html) | Visual portfolio page (GitHub Pages ready) |

---

## Built By

**Pavan Kalyan Perla**  
B.Tech CSE | Lovely Professional University  
GitHub: [@pavankalyanperla](https://github.com/pavankalyanperla)  
LinkedIn: [linkedin.com/in/pavankalyanperla](https://www.linkedin.com/in/pavankalyanperla/)
