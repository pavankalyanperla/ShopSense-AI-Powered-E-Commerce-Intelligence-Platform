# 🚀 ShopSense Service Ports - Quick Reference

## Current Services (Day 4 Complete)

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **API Gateway** | 5000 | http://localhost:5000 | ✅ Running |
| **IdentityService** | 5100 | http://localhost:5100 | ✅ Running |
| **ProductService** | 5200 | http://localhost:5200 | ✅ Running |
| **OrderService** | 5300 | http://localhost:5300 | ✅ Running |

## Future Services (Day 5+)

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **ReviewService** | 5400 | http://localhost:5400 | 🔜 Planned |
| **SellerService** | 5500 | http://localhost:5500 | 🔜 Planned |
| **NotificationService** | 5600 | http://localhost:5600 | 🔜 Planned |

## Infrastructure

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **SQL Server** | 1433 | localhost,1433 | ✅ Running |
| **Redis** | 6379 | localhost:6379 | ✅ Running |
| **RabbitMQ** | 5672 | localhost:5672 | ✅ Running |
| **RabbitMQ Management** | 15672 | http://localhost:15672 | ✅ Running |

## Frontend

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Angular App** | 4200 | http://localhost:4200 | Ready |

---

## API Routes (All via API Gateway)

### Authentication (IdentityService)
```
POST   http://localhost:5000/api/v1/auth/register
POST   http://localhost:5000/api/v1/auth/login
POST   http://localhost:5000/api/v1/auth/verify-otp
POST   http://localhost:5000/api/v1/auth/refresh-token
POST   http://localhost:5000/api/v1/auth/logout
```

### Users (IdentityService)
```
GET    http://localhost:5000/api/v1/users/{id}
PUT    http://localhost:5000/api/v1/users/{id}
DELETE http://localhost:5000/api/v1/users/{id}
```

### Products (ProductService)
```
GET    http://localhost:5000/api/v1/products
GET    http://localhost:5000/api/v1/products/{id}
POST   http://localhost:5000/api/v1/products
PUT    http://localhost:5000/api/v1/products/{id}
DELETE http://localhost:5000/api/v1/products/{id}
```

### Categories (ProductService)
```
GET    http://localhost:5000/api/v1/categories
GET    http://localhost:5000/api/v1/categories/{id}
POST   http://localhost:5000/api/v1/categories
PUT    http://localhost:5000/api/v1/categories/{id}
DELETE http://localhost:5000/api/v1/categories/{id}
```

### Cart (OrderService)
```
GET    http://localhost:5000/api/v1/cart
POST   http://localhost:5000/api/v1/cart/items
PUT    http://localhost:5000/api/v1/cart/items/{productId}
DELETE http://localhost:5000/api/v1/cart/items/{productId}
DELETE http://localhost:5000/api/v1/cart
```

### Orders (OrderService)
```
GET    http://localhost:5000/api/v1/orders
GET    http://localhost:5000/api/v1/orders/{id}
POST   http://localhost:5000/api/v1/orders/checkout
POST   http://localhost:5000/api/v1/orders/{id}/cancel
PUT    http://localhost:5000/api/v1/orders/{id}/status
```

### Coupons (OrderService)
```
GET    http://localhost:5000/api/v1/coupons
POST   http://localhost:5000/api/v1/coupons/validate
```

### Addresses (OrderService)
```
GET    http://localhost:5000/api/v1/address
POST   http://localhost:5000/api/v1/address
PUT    http://localhost:5000/api/v1/address/{id}
DELETE http://localhost:5000/api/v1/address/{id}
```

---

## Direct Service Access (Development Only)

### IdentityService (Port 5100)
```
POST   http://localhost:5100/api/v1/auth/register
POST   http://localhost:5100/api/v1/auth/login
```

### ProductService (Port 5200)
```
GET    http://localhost:5200/api/v1/products
GET    http://localhost:5200/api/v1/categories
```

### OrderService (Port 5300)
```
GET    http://localhost:5300/api/v1/cart
POST   http://localhost:5300/api/v1/orders/checkout
```

---

## Service-to-Service Communication

### OrderService → ProductService
```csharp
// appsettings.json
"Services": {
  "ProductService": "http://localhost:5200"
}
```

### Future: ReviewService → ProductService
```csharp
// appsettings.json (Day 5)
"Services": {
  "ProductService": "http://localhost:5200"
}
```

### Future: SellerService → OrderService
```csharp
// appsettings.json (Day 5)
"Services": {
  "OrderService": "http://localhost:5300"
}
```

---

## Quick Start Commands

### Start All Services
```bash
# Terminal 1 - IdentityService
cd src/backend/IdentityService.API
dotnet run

# Terminal 2 - ProductService
cd src/backend/ProductService.API
dotnet run

# Terminal 3 - OrderService
cd src/backend/OrderService.API
dotnet run

# Terminal 4 - API Gateway
cd src/backend/ApiGateway
dotnet run

# Terminal 5 - Angular Frontend
cd src/frontend/shopsense-frontend
npm start
```

### Test Services
```bash
# Test API Gateway
curl http://localhost:5000/api/v1/products

# Test IdentityService
curl http://localhost:5100/health

# Test ProductService
curl http://localhost:5200/health

# Test OrderService
curl http://localhost:5300/health
```

---

## Port Allocation Strategy

| Range | Purpose | Example |
|-------|---------|---------|
| **5000** | API Gateway | 5000 |
| **5100-5199** | Identity & Auth | 5100 |
| **5200-5299** | Product Catalog | 5200 |
| **5300-5399** | Order Management | 5300 |
| **5400-5499** | Reviews & Ratings | 5400 |
| **5500-5599** | Seller Management | 5500 |
| **5600-5699** | Notifications | 5600 |
| **4200** | Frontend | 4200 |
| **1433** | SQL Server | 1433 |
| **6379** | Redis | 6379 |
| **5672** | RabbitMQ | 5672 |
| **15672** | RabbitMQ UI | 15672 |

---

## Environment Variables

### Angular (environment.ts)
```typescript
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:5000',
  identityServiceUrl: 'http://localhost:5100',
  productServiceUrl: 'http://localhost:5200',
  orderServiceUrl: 'http://localhost:5300',
  reviewServiceUrl: 'http://localhost:5400',
  sellerServiceUrl: 'http://localhost:5500',
  notificationServiceUrl: 'http://localhost:5600'
};
```

### .NET (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ShopSense_XDB;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True"
  },
  "Jwt": {
    "Secret": "ShopSense@SuperSecretKey#2026!IndiaEcommerce$XyZ987"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "RabbitMQ": {
    "Host": "localhost",
    "Port": "5672",
    "Username": "guest",
    "Password": "guest"
  }
}
```

---

## Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| IdentityService | http://localhost:5100/health | 200 OK |
| ProductService | http://localhost:5200/health | 200 OK |
| OrderService | http://localhost:5300/health | 200 OK |
| RabbitMQ | http://localhost:15672 | Login page |

---

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port
netstat -ano | findstr :5100

# Kill process
taskkill /PID <process_id> /F
```

### Service Not Responding
```bash
# Check if service is running
curl http://localhost:5100/health

# Check logs in terminal
# Look for "Now listening on: http://localhost:5100"
```

### API Gateway Not Routing
```bash
# Verify ocelot.json has correct ports
# Check ApiGateway/ocelot.json

# Restart API Gateway
cd src/backend/ApiGateway
dotnet run
```

---

## Summary

✅ **Standardized Ports**: All services use predictable ports
✅ **Consistent Routes**: All APIs use `api/v1/` prefix
✅ **API Gateway**: Single entry point on port 5000
✅ **Ready for Day 5**: Ports allocated for future services

**Recommended**: Always use API Gateway (port 5000) for frontend and external access.
