# Database Viewer Guide - ShopSense E-commerce

## Current Database Status

### ✅ Databases Created

| Database | Status | Created Date | Tables |
|----------|--------|--------------|--------|
| **ShopSense_IdentityDB** | ✅ EXISTS | 2026-05-12 | 4 tables |
| **ShopSense_ProductDB** | ✅ EXISTS | 2026-05-12 | 7 tables |
| **ShopSense_OrderDB** | ❌ NOT CREATED | - | - |

### ⚠️ Issue: OrderDB Not Created

The OrderService is running but the database wasn't created. This is likely because:
1. Migration failed due to the warning we saw
2. Auto-migration didn't complete successfully

**Fix**: Manually create the database and apply migration (see below)

## Method 1: Using Docker + sqlcmd (Command Line)

### List All Databases
```bash
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "SELECT name, create_date FROM sys.databases ORDER BY name"
```

### List Tables in IdentityDB
```bash
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_IdentityDB; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

### List Tables in ProductDB
```bash
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_ProductDB; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

### View Table Data
```bash
# View users
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_IdentityDB; SELECT TOP 10 * FROM Users"

# View products
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_ProductDB; SELECT TOP 10 Id, Name, BasePrice FROM Products"

# View categories
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_ProductDB; SELECT * FROM Categories"
```

## Method 2: Using Azure Data Studio (Recommended - GUI)

### Download & Install
1. Download from: https://docs.microsoft.com/en-us/sql/azure-data-studio/download
2. Install Azure Data Studio
3. Launch the application

### Connect to SQL Server
1. Click "New Connection"
2. Fill in details:
   - **Server**: `localhost,1433`
   - **Authentication type**: SQL Login
   - **User name**: `sa`
   - **Password**: `YourStrong@Password123`
   - **Trust server certificate**: ✅ Check this
3. Click "Connect"

### View Databases & Tables
1. In the left sidebar, expand "Databases"
2. You'll see:
   - ShopSense_IdentityDB
   - ShopSense_ProductDB
3. Expand each database to see:
   - Tables
   - Views
   - Stored Procedures
4. Right-click on any table → "Select Top 1000" to view data

## Method 3: Using SQL Server Management Studio (SSMS)

### Download & Install
1. Download from: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
2. Install SSMS
3. Launch the application

### Connect to SQL Server
1. Server name: `localhost,1433`
2. Authentication: SQL Server Authentication
3. Login: `sa`
4. Password: `YourStrong@Password123`
5. Click "Connect"

### View Databases & Tables
1. In Object Explorer, expand "Databases"
2. Expand each ShopSense database
3. Expand "Tables" to see all tables
4. Right-click any table → "Select Top 1000 Rows"

## Method 4: Using VS Code Extension

### Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "SQL Server (mssql)"
4. Install the extension by Microsoft

### Connect to SQL Server
1. Press Ctrl+Shift+P
2. Type "MSSQL: Connect"
3. Create new connection:
   - Server: `localhost,1433`
   - Database: (leave empty)
   - Authentication: SQL Login
   - User: `sa`
   - Password: `YourStrong@Password123`
   - Trust Certificate: Yes

### View Databases & Tables
1. Click on SQL Server icon in sidebar
2. Expand your connection
3. Expand databases
4. Right-click table → "Select Top 1000"

## Method 5: Using DBeaver (Free Universal Database Tool)

### Download & Install
1. Download from: https://dbeaver.io/download/
2. Install DBeaver Community Edition
3. Launch the application

### Connect to SQL Server
1. Click "New Database Connection"
2. Select "SQL Server"
3. Fill in:
   - Host: `localhost`
   - Port: `1433`
   - Database: (leave empty)
   - Authentication: SQL Server Authentication
   - Username: `sa`
   - Password: `YourStrong@Password123`
4. Click "Test Connection"
5. Click "Finish"

### View Databases & Tables
1. Expand connection in Database Navigator
2. Expand "Databases"
3. Expand each ShopSense database
4. Expand "Tables"
5. Double-click any table to view data

## Current Database Schema

### ShopSense_IdentityDB (4 Tables)

#### 1. Users
- Id (UNIQUEIDENTIFIER)
- FullName (NVARCHAR)
- Email (NVARCHAR)
- PasswordHash (NVARCHAR)
- Role (INT)
- IsEmailVerified (BIT)
- CreatedAt (DATETIME2)
- UpdatedAt (DATETIME2)

#### 2. RefreshTokens
- Id (UNIQUEIDENTIFIER)
- UserId (UNIQUEIDENTIFIER)
- Token (NVARCHAR)
- ExpiresAt (DATETIME2)
- CreatedAt (DATETIME2)
- RevokedAt (DATETIME2)

#### 3. OtpTokens
- Id (UNIQUEIDENTIFIER)
- UserId (UNIQUEIDENTIFIER)
- Otp (NVARCHAR)
- Purpose (INT)
- ExpiresAt (DATETIME2)
- CreatedAt (DATETIME2)
- IsUsed (BIT)

#### 4. __EFMigrationsHistory
- MigrationId (NVARCHAR)
- ProductVersion (NVARCHAR)

### ShopSense_ProductDB (7 Tables)

#### 1. Products
- Id (UNIQUEIDENTIFIER)
- Name (NVARCHAR)
- Description (NVARCHAR)
- Brand (NVARCHAR)
- CategoryId (UNIQUEIDENTIFIER)
- SellerId (UNIQUEIDENTIFIER)
- SellerName (NVARCHAR)
- BasePrice (DECIMAL)
- DiscountPercent (DECIMAL)
- DiscountedPrice (DECIMAL)
- StockQuantity (INT)
- Slug (NVARCHAR)
- AverageRating (DECIMAL)
- ReviewCount (INT)
- IsActive (BIT)
- CreatedAt (DATETIME2)
- UpdatedAt (DATETIME2)

#### 2. Categories
- Id (UNIQUEIDENTIFIER)
- Name (NVARCHAR)
- Description (NVARCHAR)
- ParentCategoryId (UNIQUEIDENTIFIER)
- ImageUrl (NVARCHAR)
- IsActive (BIT)
- CreatedAt (DATETIME2)

#### 3. ProductImages
- Id (UNIQUEIDENTIFIER)
- ProductId (UNIQUEIDENTIFIER)
- ImageUrl (NVARCHAR)
- IsPrimary (BIT)
- DisplayOrder (INT)

#### 4. ProductVariants
- Id (UNIQUEIDENTIFIER)
- ProductId (UNIQUEIDENTIFIER)
- VariantType (NVARCHAR)
- VariantValue (NVARCHAR)
- PriceAdjustment (DECIMAL)
- Stock (INT)

#### 5. ProductSpecifications
- Id (UNIQUEIDENTIFIER)
- ProductId (UNIQUEIDENTIFIER)
- Key (NVARCHAR)
- Value (NVARCHAR)

#### 6. Wishlists
- Id (UNIQUEIDENTIFIER)
- CustomerId (UNIQUEIDENTIFIER)
- ProductId (UNIQUEIDENTIFIER)
- AddedAt (DATETIME2)

#### 7. __EFMigrationsHistory
- MigrationId (NVARCHAR)
- ProductVersion (NVARCHAR)

### ShopSense_OrderDB (Should Have 6 Tables - NOT CREATED YET)

Expected tables:
1. **Orders** - Main order records
2. **OrderItems** - Order line items
3. **CartItems** - Shopping cart
4. **Addresses** - Customer addresses
5. **Coupons** - Discount coupons
6. **OrderStatusHistories** - Status tracking

## Fix OrderDB Issue

### Step 1: Manually Create Database
```bash
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "CREATE DATABASE ShopSense_OrderDB"
```

### Step 2: Apply Migration
```bash
cd src/backend/OrderService.Infrastructure
dotnet ef database update --startup-project ../OrderService.API
```

### Step 3: Verify Database Created
```bash
docker exec -it shopsense-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -C -Q "USE ShopSense_OrderDB; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
```

## Quick Data Queries

### Count Records in Each Table

#### IdentityDB
```sql
USE ShopSense_IdentityDB;
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 'RefreshTokens', COUNT(*) FROM RefreshTokens
UNION ALL
SELECT 'OtpTokens', COUNT(*) FROM OtpTokens;
```

#### ProductDB
```sql
USE ShopSense_ProductDB;
SELECT 'Products' as TableName, COUNT(*) as RecordCount FROM Products
UNION ALL
SELECT 'Categories', COUNT(*) FROM Categories
UNION ALL
SELECT 'ProductImages', COUNT(*) FROM ProductImages
UNION ALL
SELECT 'ProductVariants', COUNT(*) FROM ProductVariants
UNION ALL
SELECT 'ProductSpecifications', COUNT(*) FROM ProductSpecifications
UNION ALL
SELECT 'Wishlists', COUNT(*) FROM Wishlists;
```

### View Seeded Data

#### View All Products
```sql
USE ShopSense_ProductDB;
SELECT 
    p.Name,
    p.Brand,
    c.Name as Category,
    p.BasePrice,
    p.DiscountedPrice,
    p.StockQuantity
FROM Products p
LEFT JOIN Categories c ON p.CategoryId = c.Id
ORDER BY p.Name;
```

#### View All Categories
```sql
USE ShopSense_ProductDB;
SELECT 
    Name,
    Description,
    IsActive
FROM Categories
ORDER BY Name;
```

## Recommended Tool

**For Windows**: **Azure Data Studio** (Free, Modern, Cross-platform)
- Best UI/UX
- IntelliSense support
- Query execution
- Visual table designer
- Export data easily

**Download**: https://aka.ms/azuredatastudio

## Connection String Reference

For any SQL tool, use these connection details:

```
Server: localhost,1433
Authentication: SQL Server Authentication
Username: sa
Password: YourStrong@Password123
Trust Server Certificate: Yes (or TrustServerCertificate=True)
```

**Connection String Format**:
```
Server=localhost,1433;Database=ShopSense_IdentityDB;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
```

## Summary

**Databases**: 2/3 created (OrderDB missing)
**Total Tables**: 11 tables across 2 databases
**Seeded Data**: 
- Products: 15 records
- Categories: 15 records
- Users: Check with query

**Action Required**: Create OrderDB and apply migration (see Fix OrderDB Issue section above)
