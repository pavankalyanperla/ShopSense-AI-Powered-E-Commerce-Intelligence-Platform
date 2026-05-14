# ShopSense E-Commerce Platform

A modern, microservices-based e-commerce platform built with .NET 10.0 and Angular 19.

## 🚀 Quick Start

```powershell
# Start all backend services (6 terminals)
cd src/backend/IdentityService.API && dotnet run    # Port 5100
cd src/backend/ProductService.API && dotnet run     # Port 5200
cd src/backend/OrderService.API && dotnet run       # Port 5300
cd src/backend/ReviewService.API && dotnet run      # Port 5400
cd src/backend/SellerService.API && dotnet run      # Port 5500
cd src/backend/ApiGateway && dotnet run             # Port 5000

# Start Angular frontend
cd src/frontend/shopsense-frontend && npm start     # Port 4200
```

**Access**: http://localhost:5000/swagger (API Gateway)

---

## 📚 Documentation

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get up and running in 5 minutes
- **[Complete Implementation](DAYS_COMPLETE.md)** - Full feature documentation
- **[Database Setup](DATABASE_SETUP_GUIDE.md)** - Database configuration guide
- **[Service Ports](SERVICE_PORTS_REFERENCE.md)** - Port reference

---

## 🏗️ Architecture

### Microservices
1. **IdentityService** (5100) - Authentication & user management
2. **ProductService** (5200) - Product catalog & categories
3. **OrderService** (5300) - Cart, orders, coupons, addresses
4. **ReviewService** (5400) - Reviews, ratings, sentiment analysis
5. **SellerService** (5500) - Seller management, KYC, listing coach
6. **API Gateway** (5000) - Ocelot gateway for routing

### Databases
- ShopSense_IdentityDB
- ShopSense_ProductDB
- ShopSense_OrderDB
- ShopSense_ReviewDB
- ShopSense_SellerDB

---

## 🎯 Features

### Customer Features
- ✅ User registration & authentication (JWT + OTP verification)
- ✅ Product browsing & search with advanced filters
- ✅ Shopping cart management with real-time count badge
- ✅ Order placement & tracking
- ✅ Product reviews & ratings with sentiment analysis
- ✅ Wishlist functionality with toggle
- ✅ Address management
- ✅ Coupon application
- ✅ Personalized dashboard with time-based greetings
- ✅ My reviews page with seller replies
- ✅ Password strength meter
- ✅ Responsive design (mobile-first)

### Seller Features
- ✅ Seller registration
- ✅ KYC verification (Aadhaar, PAN, GST)
- ✅ Earnings tracking
- ✅ AI-powered Listing Coach (0-100 scoring)
- ✅ Reply to customer reviews

### Admin Features
- ✅ User management
- ✅ Product management
- ✅ Category management
- ✅ Order management
- ✅ Review moderation
- ✅ Seller approval
- ✅ Coupon management

---

## 🛠️ Technology Stack

**Backend**
- .NET 10.0
- Entity Framework Core 10.0.8
- SQL Server
- JWT Authentication
- Ocelot API Gateway
- Serilog

**Frontend**
- Angular 19 (Standalone Components)
- TypeScript 5.7
- RxJS 7.8
- PrimeNG Aura Theme
- Signals API
- Responsive Design (Mobile-First)

**Tools**
- Swagger/OpenAPI
- Docker (optional)

---

## 🌐 Frontend Pages

### Public Pages
- **Landing Page** (`/home`) - Hero section, categories, ML features, featured products
- **Login** (`/auth/login`) - Two-panel design with brand showcase
- **Register** (`/auth/register`) - Role selector, password strength, OTP verification

### Customer Portal (Login Required)
- **Dashboard** (`/customer/dashboard`) - Personalized greeting, KPIs, quick actions
- **Products** (`/customer/products`) - Advanced filters, sorting, pagination
- **Product Details** (`/customer/products/:slug`) - Full details, reviews, add to cart
- **Wishlist** (`/customer/wishlist`) - Saved products with quick actions
- **Shopping Cart** (`/customer/cart`) - Cart management, coupon application
- **My Orders** (`/customer/orders`) - Order history and tracking
- **My Reviews** (`/customer/reviews`) - Customer reviews with sentiment tags

### Design Highlights
- **Theme**: PrimeNG Aura with custom ShopSense design tokens
- **Colors**: Brand Blue (#1F4E79), Light Blue (#2563EB), Indian context
- **Currency**: ₹ (Indian Rupee)
- **Responsive**: Mobile-first design (375px+)
- **Loading**: Skeleton states throughout
- **Empty States**: Helpful messages with action buttons

---

## 📊 API Endpoints

### IdentityService (5100)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
```

### ProductService (5200)
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/categories
POST   /api/v1/categories
```

### OrderService (5300)
```
GET    /api/v1/cart
POST   /api/v1/cart/items
POST   /api/v1/orders
GET    /api/v1/orders
POST   /api/v1/coupons
GET    /api/v1/address
```

### ReviewService (5400)
```
POST   /api/v1/reviews
GET    /api/v1/reviews/product/{id}
GET    /api/v1/reviews/{id}/summary
POST   /api/v1/reviews/{id}/reply
```

### SellerService (5500)
```
POST   /api/v1/sellers/register
POST   /api/v1/sellers/{id}/kyc
GET    /api/v1/sellers/{id}/earnings
POST   /api/v1/sellers/listing-coach
```

**Full API documentation**: See [DAYS_COMPLETE.md](DAYS_COMPLETE.md)

---

## 🔧 Configuration

### Database Connection
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ShopSense_<ServiceName>DB;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
  }
}
```

### JWT Configuration
```json
{
  "Jwt": {
    "Secret": "ShopSense@SuperSecretKey#2026!IndiaEcommerce$XyZ987",
    "ExpiryDays": 7
  }
}
```

---

## 🧪 Testing

### Backend Testing
1. Register user: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login`
3. Create product: `POST /api/v1/products`
4. Add to cart: `POST /api/v1/cart/items`
5. Create order: `POST /api/v1/orders`
6. Write review: `POST /api/v1/reviews`

### Frontend Testing
1. Open http://localhost:4200/home
2. Browse categories and featured products
3. Register new account with OTP verification
4. Login and view personalized dashboard
5. Search and filter products
6. Add products to wishlist and cart
7. Place order and write review

**Detailed testing guide**: See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

## 📦 Project Structure

```
ShopSense-Ecommerce/
├── src/
│   ├── backend/
│   │   ├── ApiGateway/
│   │   ├── IdentityService.API/
│   │   ├── IdentityService.Application/
│   │   ├── IdentityService.Domain/
│   │   ├── IdentityService.Infrastructure/
│   │   ├── ProductService.*/
│   │   ├── OrderService.*/
│   │   ├── ReviewService.*/
│   │   └── SellerService.*/
│   └── frontend/
│       └── shopsense-frontend/
├── docs/
├── DAYS_COMPLETE.md
├── QUICK_START_GUIDE.md
├── DATABASE_SETUP_GUIDE.md
└── README.md
```

---

## 🚦 Status

| Component | Status | Details |
|-----------|--------|---------|
| IdentityService | ✅ Complete | JWT auth, user management |
| ProductService | ✅ Complete | Catalog, categories, search |
| OrderService | ✅ Complete | Cart, orders, coupons, addresses |
| ReviewService | ✅ Complete | Reviews, ratings, sentiment analysis |
| SellerService | ✅ Complete | KYC, earnings, listing coach |
| API Gateway | ✅ Complete | Ocelot routing, CORS |
| Angular Frontend | ✅ Complete | 10+ pages, responsive design |

**Build Status**: ✅ All services build successfully (0 errors, 0 warnings)  
**Frontend Build**: ✅ Bundle: 971.38 KB (167.23 KB gzipped)  
**Total Endpoints**: 50+  
**Total Databases**: 5  
**Total Frontend Pages**: 10+  
**Lines of Code**: ~6,500 (Frontend) + ~15,000 (Backend)

---

## 🔐 Security

- JWT token-based authentication
- Password hashing with BCrypt
- Role-based authorization (Customer, Seller, Admin)
- CORS configured for Angular frontend
- SQL injection prevention via EF Core

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
netstat -ano | findstr "5000"
taskkill /PID <process-id> /F
```

### Database Connection Failed
- Ensure SQL Server is running
- Verify connection string in appsettings.json
- Check SQL Server authentication mode

### Build Errors
```powershell
dotnet clean
dotnet restore
dotnet build
```

---

## 📝 License

This project is for educational purposes.

---

## 👥 Contributing

This is a learning project. Feel free to fork and experiment!

---

## 📞 Support

For issues or questions, check the documentation:
- [DAYS_COMPLETE.md](DAYS_COMPLETE.md) - Complete feature documentation
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Setup and testing guide
- [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) - Database configuration

---

**Built with ❤️ using .NET 10.0 and Angular 19**
