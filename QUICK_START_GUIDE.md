# ShopSense E-Commerce - Quick Start Guide

## Prerequisites

- .NET 10.0 SDK
- SQL Server (LocalDB or Express)
- Node.js 18+ (for Angular frontend)
- Visual Studio Code or Visual Studio 2022

---

## 1. Start All Backend Services

Open 6 separate terminals and run:

```powershell
# Terminal 1 - IdentityService (Port 5100)
cd src/backend/IdentityService.API
dotnet run

# Terminal 2 - ProductService (Port 5200)
cd src/backend/ProductService.API
dotnet run

# Terminal 3 - OrderService (Port 5300)
cd src/backend/OrderService.API
dotnet run

# Terminal 4 - ReviewService (Port 5400)
cd src/backend/ReviewService.API
dotnet run

# Terminal 5 - SellerService (Port 5500)
cd src/backend/SellerService.API
dotnet run

# Terminal 6 - API Gateway (Port 5000)
cd src/backend/ApiGateway
dotnet run
```

**Note**: Databases will be automatically created on first run.

---

## 2. Start Angular Frontend (Optional)

```powershell
cd src/frontend/shopsense-frontend
npm install
npm start
```

Frontend will be available at: http://localhost:4200

---

## 3. Access Swagger Documentation

- **API Gateway**: http://localhost:5000/swagger
- **IdentityService**: http://localhost:5100/swagger
- **ProductService**: http://localhost:5200/swagger
- **OrderService**: http://localhost:5300/swagger
- **ReviewService**: http://localhost:5400/swagger
- **SellerService**: http://localhost:5500/swagger

---

## 4. Quick Test Flow

### Step 1: Register a User
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123",
  "fullName": "Test User",
  "phoneNumber": "9876543210"
}
```

### Step 2: Login
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123"
}
```

**Save the JWT token from the response!**

### Step 3: Create a Product (Admin only)
```bash
POST http://localhost:5000/api/v1/products
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "Premium wireless headphones with noise cancellation",
  "price": 2999,
  "stock": 50,
  "categoryId": "guid-here",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Step 4: Add to Cart
```bash
POST http://localhost:5000/api/v1/cart/items
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "productId": "product-guid",
  "quantity": 1
}
```

### Step 5: Create Order
```bash
POST http://localhost:5000/api/v1/orders
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "shippingAddressId": "address-guid",
  "couponCode": "WELCOME10"
}
```

### Step 6: Create Review
```bash
POST http://localhost:5000/api/v1/reviews
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "productId": "product-guid",
  "productName": "Wireless Headphones",
  "orderId": "order-guid",
  "rating": 5,
  "title": "Excellent product!",
  "body": "Great sound quality and comfortable to wear."
}
```

### Step 7: Register as Seller
```bash
POST http://localhost:5000/api/v1/sellers/register
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "businessName": "My Electronics Store",
  "phoneNumber": "9876543210"
}
```

### Step 8: Submit KYC
```bash
POST http://localhost:5000/api/v1/sellers/{sellerId}/kyc
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "gstNumber": "12ABCDE1234F1Z5",
  "bankAccountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "bankName": "State Bank of India"
}
```

### Step 9: Get Listing Coach Score
```bash
POST http://localhost:5000/api/v1/sellers/listing-coach
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Premium Wireless Bluetooth Headphones with Active Noise Cancellation",
  "description": "Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers, travelers, and professionals who demand the best sound quality. Features include Bluetooth 5.0, quick charging, and premium materials.",
  "price": 2999,
  "category": "Electronics",
  "images": ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg"],
  "specifications": {
    "Battery Life": "30 hours",
    "Bluetooth": "5.0",
    "Weight": "250g",
    "Color": "Black",
    "Warranty": "1 year"
  },
  "stockQuantity": 50
}
```

---

## 5. Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 5000 | http://localhost:5000 |
| IdentityService | 5100 | http://localhost:5100 |
| ProductService | 5200 | http://localhost:5200 |
| OrderService | 5300 | http://localhost:5300 |
| ReviewService | 5400 | http://localhost:5400 |
| SellerService | 5500 | http://localhost:5500 |

---

## 6. Database Verification

```sql
-- Check all databases exist
SELECT name FROM sys.databases 
WHERE name LIKE 'ShopSense_%';

-- Should show:
-- ShopSense_IdentityDB
-- ShopSense_ProductDB
-- ShopSense_OrderDB
-- ShopSense_ReviewDB
-- ShopSense_SellerDB

-- View data
USE ShopSense_IdentityDB;
SELECT * FROM Users;

USE ShopSense_ProductDB;
SELECT * FROM Products;

USE ShopSense_OrderDB;
SELECT * FROM Orders;

USE ShopSense_ReviewDB;
SELECT * FROM Reviews;

USE ShopSense_SellerDB;
SELECT * FROM Sellers;
```

---

## 7. KYC Validation Rules

### Valid Formats (Approved)
- **Aadhaar**: Exactly 12 digits (e.g., `123456789012`)
- **PAN**: 5 letters + 4 digits + 1 letter (e.g., `ABCDE1234F`)
- **GST**: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit + Z + alphanumeric (e.g., `12ABCDE1234F1Z5`)

### Invalid Formats (Rejected)
- **Aadhaar**: `12345` (too short)
- **PAN**: `INVALID` (wrong format)
- **GST**: `WRONG` (wrong format)

---

## 8. Listing Coach Scoring

| Category | Max Points | Optimal Criteria |
|----------|-----------|------------------|
| Title | 20 | 40-80 characters |
| Description | 25 | 300+ words |
| Images | 20 | 5-8 images |
| Specifications | 15 | 5+ specifications |
| Price | 10 | Valid price set |
| Stock | 10 | 10+ units |
| **Total** | **100** | |

**Grades**: A+ (90+), A (80+), B (70+), C (60+), D (50+), F (<50)

---

## 9. Troubleshooting

### Port Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr "5000"

# Kill the process
taskkill /PID <process-id> /F
```

### Database Connection Issues
- Ensure SQL Server is running
- Check connection string in appsettings.json
- Verify SQL Server authentication

### Build Errors
```powershell
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Migration Issues
```powershell
# Recreate migrations
dotnet ef migrations remove --project <Project>.Infrastructure --startup-project <Project>.API
dotnet ef migrations add InitialCreate --project <Project>.Infrastructure --startup-project <Project>.API
```

---

## 10. Default Admin Credentials

If you've seeded the database with default data:

```
Email: admin@shopsense.com
Password: Admin@123
```

---

## 11. Common Commands

### Build All Services
```powershell
cd src/backend
dotnet build
```

### Run Tests (if available)
```powershell
dotnet test
```

### Create New Migration
```powershell
dotnet ef migrations add <MigrationName> \
  --project <Service>.Infrastructure \
  --startup-project <Service>.API \
  --context <DbContext>
```

### Update Database
```powershell
dotnet ef database update \
  --project <Service>.Infrastructure \
  --startup-project <Service>.API
```

---

## 12. API Testing Tools

### Using cURL
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

### Using Postman
1. Import the Swagger JSON from any service
2. Set up environment variables for base URL and token
3. Use collections for organized testing

### Using Swagger UI
1. Navigate to http://localhost:5000/swagger
2. Click "Authorize" button
3. Enter: `Bearer <your-token>`
4. Test endpoints directly in browser

---

## 13. Development Tips

### Hot Reload
```powershell
dotnet watch run
```

### View Logs
All services use Serilog and log to console. Check terminal output for errors.

### Database Viewer
Use SQL Server Management Studio (SSMS) or Azure Data Studio to view databases.

---

## Quick Reference

**All services running?** Check: http://localhost:5000/swagger  
**Database issues?** Run: `dotnet ef database update`  
**Build errors?** Run: `dotnet clean && dotnet restore && dotnet build`  
**Port conflicts?** Run: `netstat -ano | findstr "<port>"`

---

**Need help?** Check the detailed documentation in `DAYS_COMPLETE.md`
