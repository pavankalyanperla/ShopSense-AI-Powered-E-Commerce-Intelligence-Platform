# OrderService Database Setup Guide

## Current Status

✅ **Migration Created**: The EF Core migration file exists at:
- `src/backend/OrderService.Infrastructure/Migrations/20260512201016_InitialCreate.cs`

✅ **Tables Defined**: The migration will create 6 tables:
1. **Orders** - Main order records
2. **OrderItems** - Order line items
3. **CartItems** - Shopping cart items
4. **Addresses** - Customer delivery addresses
5. **Coupons** - Discount coupons
6. **OrderStatusHistories** - Order status change tracking

✅ **Seeded Data**: 3 coupons will be automatically inserted:
- WELCOME10
- FLAT100
- DIWALI20

## How Tables Are Created

The OrderService uses **automatic migration** on startup. When you run the OrderService for the first time, it will:

1. Check if the database exists
2. Create the database if it doesn't exist
3. Apply all pending migrations
4. Create all tables
5. Insert seed data

This is configured in `src/backend/OrderService.API/Program.cs`:

```csharp
// Auto-migrate database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    try
    {
        dbContext.Database.Migrate();
        Log.Information("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while migrating the database");
    }
}
```

## Method 1: Automatic (Recommended)

### Step 1: Start OrderService
```bash
cd src/backend/OrderService.API
dotnet run
```

### Step 2: Check Logs
You should see:
```
[INF] Database migration completed successfully
```

### Step 3: Verify Tables
The tables will be created automatically in the `ShopSense_OrderDB` database.

## Method 2: Manual Migration

If you prefer to apply migrations manually:

### Step 1: Update Database Manually
```bash
cd src/backend/OrderService.Infrastructure
dotnet ef database update --startup-project ../OrderService.API
```

### Step 2: Verify
```bash
# Check migration status
dotnet ef migrations list --startup-project ../OrderService.API
```

## Verify Database Tables

### Option A: Using SQL Script

Run the verification script I created:

```bash
# Using sqlcmd
sqlcmd -S localhost,1433 -U sa -P YourPassword -i verify-orderdb.sql

# Or using SQL Server Management Studio (SSMS)
# Open verify-orderdb.sql and execute
```

### Option B: Using SQL Query

Connect to SQL Server and run:

```sql
USE ShopSense_OrderDB;
GO

-- List all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Expected output:
-- Addresses
-- CartItems
-- Coupons
-- OrderItems
-- Orders
-- OrderStatusHistories
```

### Option C: Using .NET CLI

```bash
cd src/backend/OrderService.Infrastructure

# List migrations
dotnet ef migrations list --startup-project ../OrderService.API

# Check if database exists
dotnet ef database update --startup-project ../OrderService.API --verbose
```

## Verify Seeded Coupons

```sql
USE ShopSense_OrderDB;
GO

SELECT 
    Code,
    Description,
    DiscountType,
    DiscountValue,
    MinOrderValue,
    MaxDiscountAmount,
    IsActive
FROM Coupons;
```

**Expected Result**:
| Code | Description | DiscountType | DiscountValue | MinOrderValue | MaxDiscountAmount | IsActive |
|------|-------------|--------------|---------------|---------------|-------------------|----------|
| WELCOME10 | Get 10% off on your first order | 1 (Percentage) | 10 | 500 | 100 | 1 |
| FLAT100 | Flat ₹100 off on orders above ₹999 | 2 (Flat) | 100 | 999 | NULL | 1 |
| DIWALI20 | Diwali Special - 20% off up to ₹200 | 1 (Percentage) | 20 | 1500 | 200 | 1 |

## Table Schema Details

### 1. Orders Table
```sql
CREATE TABLE Orders (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OrderNumber NVARCHAR(450) UNIQUE NOT NULL,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    CustomerEmail NVARCHAR(MAX) NOT NULL,
    CustomerName NVARCHAR(MAX) NOT NULL,
    Status INT NOT NULL,
    PaymentMethod INT NOT NULL,
    PaymentStatus INT NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL,
    DeliveryCharge DECIMAL(18,2) NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    CouponId UNIQUEIDENTIFIER NULL,
    CouponCode NVARCHAR(MAX) NULL,
    FraudScore FLOAT NULL,
    IsFraudFlagged BIT NOT NULL,
    DeliveryAddressId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    DeliveredAt DATETIME2 NULL,
    FOREIGN KEY (DeliveryAddressId) REFERENCES Addresses(Id)
);
```

### 2. OrderItems Table
```sql
CREATE TABLE OrderItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    ProductName NVARCHAR(MAX) NOT NULL,
    ProductImageUrl NVARCHAR(MAX) NOT NULL,
    SellerName NVARCHAR(MAX) NOT NULL,
    SellerId UNIQUEIDENTIFIER NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    FinalPrice DECIMAL(18,2) NOT NULL,
    SelectedVariant NVARCHAR(MAX) NULL,
    ReturnStatus INT NULL,
    ReturnReason NVARCHAR(MAX) NULL,
    ReturnRequestedAt DATETIME2 NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
);
```

### 3. CartItems Table
```sql
CREATE TABLE CartItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    ProductName NVARCHAR(MAX) NOT NULL,
    ProductImageUrl NVARCHAR(MAX) NOT NULL,
    SellerName NVARCHAR(MAX) NOT NULL,
    SellerId UNIQUEIDENTIFIER NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    MaxStock INT NOT NULL,
    SelectedVariant NVARCHAR(MAX) NULL,
    AddedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL
);
```

### 4. Addresses Table
```sql
CREATE TABLE Addresses (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    FullName NVARCHAR(MAX) NOT NULL,
    PhoneNumber NVARCHAR(MAX) NOT NULL,
    Line1 NVARCHAR(MAX) NOT NULL,
    Line2 NVARCHAR(MAX) NULL,
    City NVARCHAR(MAX) NOT NULL,
    State NVARCHAR(MAX) NOT NULL,
    Pincode NVARCHAR(MAX) NOT NULL,
    Country NVARCHAR(MAX) NOT NULL,
    IsDefault BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL
);
```

### 5. Coupons Table
```sql
CREATE TABLE Coupons (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Code NVARCHAR(450) UNIQUE NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    DiscountType INT NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinOrderValue DECIMAL(18,2) NOT NULL,
    MaxDiscountAmount DECIMAL(18,2) NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UsageLimit INT NOT NULL,
    UsedCount INT NOT NULL,
    IsActive BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL
);
```

### 6. OrderStatusHistories Table
```sql
CREATE TABLE OrderStatusHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    Status INT NOT NULL,
    Note NVARCHAR(MAX) NULL,
    ChangedAt DATETIME2 NOT NULL,
    ChangedBy NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
);
```

## Indexes Created

The migration also creates these indexes for performance:

```sql
-- Addresses
CREATE INDEX IX_Addresses_CustomerId ON Addresses(CustomerId);

-- CartItems
CREATE INDEX IX_CartItems_CustomerId ON CartItems(CustomerId);

-- Coupons
CREATE UNIQUE INDEX IX_Coupons_Code ON Coupons(Code);

-- Orders
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_DeliveryAddressId ON Orders(DeliveryAddressId);
CREATE UNIQUE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber);

-- OrderItems
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);

-- OrderStatusHistories
CREATE INDEX IX_OrderStatusHistories_OrderId ON OrderStatusHistories(OrderId);
```

## Troubleshooting

### Issue: Database Not Created

**Solution 1**: Check connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ShopSense_OrderDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
  }
}
```

**Solution 2**: Manually create database:
```sql
CREATE DATABASE ShopSense_OrderDB;
GO
```

### Issue: Migration Not Applied

**Check migration status**:
```bash
cd src/backend/OrderService.Infrastructure
dotnet ef migrations list --startup-project ../OrderService.API
```

**Apply manually**:
```bash
dotnet ef database update --startup-project ../OrderService.API
```

### Issue: Tables Not Visible

**Check if you're in the correct database**:
```sql
-- Make sure you're using the right database
USE ShopSense_OrderDB;
GO

-- List all tables
SELECT * FROM INFORMATION_SCHEMA.TABLES;
```

### Issue: Coupons Not Seeded

**Check coupon count**:
```sql
SELECT COUNT(*) FROM Coupons;
```

**If 0, manually insert**:
```sql
INSERT INTO Coupons (Id, Code, Description, DiscountType, DiscountValue, MinOrderValue, MaxDiscountAmount, ExpiresAt, UsageLimit, UsedCount, IsActive, CreatedAt)
VALUES 
('11111111-1111-1111-1111-111111111111', 'WELCOME10', 'Get 10% off on your first order', 1, 10, 500, 100, DATEADD(MONTH, 6, GETUTCDATE()), 1000, 0, 1, GETUTCDATE()),
('22222222-2222-2222-2222-222222222222', 'FLAT100', 'Flat ₹100 off on orders above ₹999', 2, 100, 999, NULL, DATEADD(MONTH, 3, GETUTCDATE()), 500, 0, 1, GETUTCDATE()),
('33333333-3333-3333-3333-333333333333', 'DIWALI20', 'Diwali Special - 20% off up to ₹200', 1, 20, 1500, 200, DATEADD(MONTH, 2, GETUTCDATE()), 2000, 0, 1, GETUTCDATE());
```

## Quick Verification Commands

```bash
# 1. Check if OrderService can connect to database
cd src/backend/OrderService.API
dotnet run

# 2. Check migration status
cd src/backend/OrderService.Infrastructure
dotnet ef migrations list --startup-project ../OrderService.API

# 3. View migration SQL (without applying)
dotnet ef migrations script --startup-project ../OrderService.API

# 4. Apply migration manually
dotnet ef database update --startup-project ../OrderService.API

# 5. Remove last migration (if needed)
dotnet ef migrations remove --startup-project ../OrderService.API
```

## Summary

✅ **Migration file exists**: `20260512201016_InitialCreate.cs`
✅ **Auto-migration enabled**: Tables will be created on first run
✅ **6 tables will be created**: Orders, OrderItems, CartItems, Addresses, Coupons, OrderStatusHistories
✅ **3 coupons will be seeded**: WELCOME10, FLAT100, DIWALI20
✅ **Verification script provided**: `verify-orderdb.sql`

**Next Step**: Simply run the OrderService and the database will be set up automatically!

```bash
cd src/backend/OrderService.API
dotnet run
```

The tables will be created automatically when the service starts! 🚀
