# ShopSense Architecture

## Overview

ShopSense is a polyglot microservices platform combining
.NET, Python, and Angular in a single deployable system.

## Key Architecture Decisions

### 1. Microservices over Monolith
Each domain (Identity, Product, Order, Review, Seller,
Notification) is an independent service with its own
database (Database-per-Service pattern). This enables
independent deployment, scaling, and technology choices.

### 2. Clean Architecture (.NET Services)
Each .NET service follows Clean Architecture with 4 layers:
- **Domain** — Entities, value objects, domain events
- **Application** — Use cases, DTOs, service interfaces
- **Infrastructure** — EF Core, external service clients
- **API** — Controllers, middleware, dependency injection

Dependencies flow inward: API → Application → Domain.
Infrastructure implements Application interfaces.

### 3. API Gateway Pattern (Ocelot)
All client requests route through a single Ocelot gateway
(port 5000) which handles:
- Request routing to downstream services
- Rate limiting
- JWT token validation forwarding
- Load balancing configuration

### 4. Event-Driven Communication (RabbitMQ)
Asynchronous events for cross-service communication:
- OrderService publishes: order.placed, order.cancelled
- SellerService publishes: kyc.decision
- NotificationService consumes all events and sends emails

### 5. ML Services as Sidecar APIs
Python FastAPI services run alongside .NET services,
accessed directly by the Angular frontend (not through
Ocelot). This avoids gateway overhead for ML inference
and allows independent ML model updates.

### 6. Hybrid Dashboard Data Strategy
The Admin Intelligence Dashboard uses a hybrid approach:
- Mock data loads instantly (no loading spinner)
- "Refresh" button calls real ML APIs
- Graceful degradation if any service is down

### 7. CSS-Only Charts (No Chart.js)
After encountering page freeze issues with Chart.js
inside Angular's lazy-loaded router outlets, all dashboard
visualizations were rebuilt using:
- Pure CSS div bars for forecast charts
- CSS conic-gradient for donut charts
- Result: 89% bundle size reduction (236KB → 25KB)

### 8. JWT with Redis Token Blacklisting
Authentication uses JWT tokens with Redis-backed
blacklisting for secure logout:
- Access token: 60-minute expiry
- Refresh token: 7-day expiry
- Logout invalidates tokens via Redis SET
- BCrypt (work factor 12) for password hashing

## Technology Matrix

| Concern | Technology | Why |
|---|---|---|
| API Framework | ASP.NET Core 10 | Performance, type safety |
| ML Framework | FastAPI | Async, auto-docs, Pydantic |
| Frontend | Angular 21 | Enterprise features, TypeScript |
| UI Library | PrimeNG Aura | 90+ components, theming |
| Database | SQL Server 2022 | ACID, EF Core integration |
| Cache | Redis 7 | Token blacklist, ML cache |
| Message Bus | RabbitMQ 3 | Reliable async messaging |
| Gateway | Ocelot | .NET native, config-driven |
| Containers | Docker Compose | 17-container orchestration |
| CI/CD | GitHub Actions | Free, native GitHub integration |
| Testing | NUnit + pytest | Industry standard |

## Data Flow

```
User → Angular → Ocelot Gateway → .NET Microservice → SQL Server
                                                     → Redis (cache/blacklist)
                                                     → RabbitMQ → NotificationService → Email
                              → Python ML Service   → Model Inference
```

## Service Responsibilities

| Service | Port | Responsibility |
|---|---|---|
| IdentityService | 5100 | Auth, JWT, OTP email, Google OAuth, refresh tokens |
| ProductService | 5200 | Products, categories, wishlist, search |
| OrderService | 5300 | Cart, checkout, orders, coupons, returns |
| ReviewService | 5400 | Product reviews, ratings, sentiment trigger |
| SellerService | 5500 | Seller KYC, listing management |
| NotificationService | 5600 | Email dispatch via RabbitMQ consumer |
| ApiGateway | 5000 | Ocelot reverse proxy + JWT forwarding |
| FraudService | 8001 | XGBoost fraud scoring at checkout |
| RecommendationService | 8002 | SVD collaborative filtering |
| SentimentService | 8003 | TF-IDF review classification |
| ForecastingService | 8004 | Holt-Winters revenue forecasting |
| ChurnService | 8005 | XGBoost churn probability |
| PricingService | 8006 | GBR optimal price recommendation |
