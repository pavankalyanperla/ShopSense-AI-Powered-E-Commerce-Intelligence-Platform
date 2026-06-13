# ShopSense API Reference

Base URL: `http://localhost:5000` (via Ocelot Gateway)

All protected endpoints require: `Authorization: Bearer <jwt_token>`

---

## Authentication

### POST /api/v1/auth/register
Register a new user.
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "Customer | Seller | Admin"
}
```

### POST /api/v1/auth/login
Login and receive JWT token.
```json
{
  "email": "string",
  "password": "string"
}
```
Response:
```json
{
  "token": "eyJ...",
  "refreshToken": "...",
  "user": {
    "id": "guid",
    "fullName": "string",
    "email": "string",
    "role": "Admin",
    "isEmailVerified": true
  }
}
```

### POST /api/v1/auth/verify-otp
Verify email with OTP code.
```json
{ "email": "string", "otp": "string" }
```

### POST /api/v1/auth/logout
Invalidate token (requires Authorization header).

### POST /api/v1/auth/refresh
Exchange refresh token for new JWT.
```json
{ "refreshToken": "string" }
```

---

## Products

### GET /api/v1/products?pageSize=10&page=1
List products with pagination.

### GET /api/v1/products/{id}
Get product by ID.

### POST /api/v1/products
Create product (requires Seller role).

### PUT /api/v1/products/{id}
Update product (requires Seller role, owner only).

### GET /api/v1/categories
List all categories.

### GET /api/v1/products/wishlist
Get current user's wishlist (requires auth).

### POST /api/v1/products/wishlist
Add to wishlist (requires auth).
```json
{ "productId": "guid" }
```

---

## Orders

### GET /api/v1/cart
Get current user's cart (requires auth).

### POST /api/v1/cart
Add item to cart (requires auth).
```json
{
  "productId": "guid",
  "quantity": 1,
  "selectedVariant": "string (optional)"
}
```

### PUT /api/v1/cart/{itemId}
Update cart item quantity (requires auth).

### DELETE /api/v1/cart/{itemId}
Remove item from cart (requires auth).

### POST /api/v1/orders/checkout
Place order from cart (requires auth).
```json
{
  "paymentMethod": "COD | UPI | DebitCard | CreditCard | NetBanking",
  "couponCode": "WELCOME10 (optional)",
  "deliveryAddressId": "guid"
}
```

### GET /api/v1/orders
List user's orders (requires auth).

### GET /api/v1/orders/{id}
Get order detail (requires auth).

### POST /api/v1/coupons/validate
Validate a coupon code.
```json
{ "couponCode": "string", "cartTotal": 1500.00 }
```

---

## Reviews

### POST /api/v1/reviews
Submit product review (requires auth).
```json
{
  "productId": "guid",
  "rating": 5,
  "comment": "string"
}
```

### GET /api/v1/reviews/product/{productId}
Get reviews for a product.

---

## Sellers

### POST /api/v1/sellers/kyc
Submit KYC documents (requires Seller role).

### GET /api/v1/sellers/admin/all
List all sellers (requires Admin role).

### PUT /api/v1/sellers/admin/{sellerId}/approve
Approve seller KYC (requires Admin role).

### PUT /api/v1/sellers/admin/{sellerId}/reject
Reject seller KYC (requires Admin role).

---

## ML Services (Direct Access — no Gateway)

### FraudService — http://localhost:8001

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /model/info | Model metadata |
| POST | /predict/fraud | Predict fraud probability |
| GET | /predict/fraud/test | Test with high-risk sample |
| POST | /predict/fraud/batch | Batch predictions (max 100) |

**POST /predict/fraud body:**
```json
{
  "transaction_amount": 5000,
  "payment_method": "UPI",
  "product_category": "Electronics",
  "quantity": 1,
  "customer_age": 30,
  "account_age_days": 365,
  "transaction_hour": 14,
  "device_used": "Mobile"
}
```

### RecommendationService — http://localhost:8002

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /model/info | Model metadata |
| GET | /recommend/{user_id}?limit=10 | Get recommendations |
| GET | /similar/{product_id}?limit=10 | Similar products |
| GET | /popular?limit=10 | Popular products |
| DELETE | /cache/{user_id} | Invalidate user cache |

### SentimentService — http://localhost:8003

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /analyze/sentiment | Analyze single review |
| POST | /analyze/sentiment/batch | Batch analysis (max 100) |
| POST | /analyze/product/{id} | Product sentiment summary |
| GET | /analyze/sentiment/test | Test positive sample |
| GET | /analyze/sentiment/test/negative | Test negative sample |

**POST /analyze/sentiment body:**
```json
{ "review_text": "Great product, very happy with quality!" }
```

### ForecastingService — http://localhost:8004

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /forecast/sales?days=30 | Revenue forecast (7–180 days) |
| GET | /forecast/category/{cat}?days=30 | Category forecast |
| GET | /forecast/weekly | 7-day forecast |
| GET | /summary/sales | Historical sales summary |
| GET | /summary/states | State-wise revenue |
| GET | /summary/categories | Category revenue |

### ChurnService — http://localhost:8005

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /predict/churn | Predict churn probability |
| POST | /predict/churn/batch | Batch predictions (max 100) |
| GET | /churn/citytier-analysis | Churn by CityTier |
| GET | /churn/risk-segments | Risk segment summary |
| GET | /predict/churn/test/high-risk | Test high-risk profile |
| GET | /predict/churn/test/low-risk | Test low-risk profile |

### PricingService — http://localhost:8006

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /predict/price | Get optimal price |
| POST | /predict/price/batch | Batch predictions (max 50) |
| GET | /pricing/category-benchmarks | Price benchmarks |
| GET | /pricing/insights | Platform pricing insights |
| GET | /pricing/category/{cat} | Single category benchmark |
| GET | /predict/price/test | Test with sample product |

**POST /predict/price body:**
```json
{
  "product_id": "PROD001",
  "category": "Electronics",
  "current_price": 999.0,
  "quantity_available": 50,
  "ship_state": "MAHARASHTRA"
}
```
