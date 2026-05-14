-- ============================================
-- OrderService Database Verification Script
-- ============================================

USE ShopSense_OrderDB;
GO

-- Check if database exists
IF DB_ID('ShopSense_OrderDB') IS NOT NULL
    PRINT '✓ Database ShopSense_OrderDB exists'
ELSE
    PRINT '✗ Database ShopSense_OrderDB does NOT exist'
GO

-- Check if tables exist
PRINT ''
PRINT '=== TABLE VERIFICATION ==='
PRINT ''

-- 1. Orders table
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL
    PRINT '✓ Orders table exists'
ELSE
    PRINT '✗ Orders table does NOT exist'

-- 2. OrderItems table
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL
    PRINT '✓ OrderItems table exists'
ELSE
    PRINT '✗ OrderItems table does NOT exist'

-- 3. CartItems table
IF OBJECT_ID('dbo.CartItems', 'U') IS NOT NULL
    PRINT '✓ CartItems table exists'
ELSE
    PRINT '✗ CartItems table does NOT exist'

-- 4. Addresses table
IF OBJECT_ID('dbo.Addresses', 'U') IS NOT NULL
    PRINT '✓ Addresses table exists'
ELSE
    PRINT '✗ Addresses table does NOT exist'

-- 5. Coupons table
IF OBJECT_ID('dbo.Coupons', 'U') IS NOT NULL
    PRINT '✓ Coupons table exists'
ELSE
    PRINT '✗ Coupons table does NOT exist'

-- 6. OrderStatusHistories table
IF OBJECT_ID('dbo.OrderStatusHistories', 'U') IS NOT NULL
    PRINT '✓ OrderStatusHistories table exists'
ELSE
    PRINT '✗ OrderStatusHistories table does NOT exist'

PRINT ''
PRINT '=== TABLE DETAILS ==='
PRINT ''

-- Show all tables in the database
SELECT 
    TABLE_NAME as 'Table Name',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as 'Column Count'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

PRINT ''
PRINT '=== COUPON DATA VERIFICATION ==='
PRINT ''

-- Check if coupons are seeded
IF OBJECT_ID('dbo.Coupons', 'U') IS NOT NULL
BEGIN
    DECLARE @CouponCount INT
    SELECT @CouponCount = COUNT(*) FROM Coupons
    
    IF @CouponCount >= 3
        PRINT '✓ Coupons seeded successfully (' + CAST(@CouponCount AS VARCHAR) + ' coupons found)'
    ELSE
        PRINT '✗ Coupons NOT seeded (only ' + CAST(@CouponCount AS VARCHAR) + ' coupons found)'
    
    -- Show coupon details
    PRINT ''
    PRINT 'Coupon Details:'
    SELECT 
        Code,
        Description,
        CASE DiscountType 
            WHEN 1 THEN 'Percentage'
            WHEN 2 THEN 'Flat'
            ELSE 'Unknown'
        END as DiscountType,
        DiscountValue,
        MinOrderValue,
        MaxDiscountAmount,
        IsActive,
        ExpiresAt
    FROM Coupons
    ORDER BY Code;
END

PRINT ''
PRINT '=== MIGRATION HISTORY ==='
PRINT ''

-- Check migration history
IF OBJECT_ID('dbo.__EFMigrationsHistory', 'U') IS NOT NULL
BEGIN
    SELECT 
        MigrationId,
        ProductVersion
    FROM __EFMigrationsHistory
    ORDER BY MigrationId;
END
ELSE
    PRINT '✗ No migration history found'

PRINT ''
PRINT '=== RECORD COUNTS ==='
PRINT ''

-- Show record counts for all tables
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL
BEGIN
    DECLARE @OrderCount INT, @OrderItemCount INT, @CartItemCount INT, 
            @AddressCount INT, @CouponCount2 INT, @StatusHistoryCount INT
    
    SELECT @OrderCount = COUNT(*) FROM Orders
    SELECT @OrderItemCount = COUNT(*) FROM OrderItems
    SELECT @CartItemCount = COUNT(*) FROM CartItems
    SELECT @AddressCount = COUNT(*) FROM Addresses
    SELECT @CouponCount2 = COUNT(*) FROM Coupons
    SELECT @StatusHistoryCount = COUNT(*) FROM OrderStatusHistories
    
    PRINT 'Orders: ' + CAST(@OrderCount AS VARCHAR)
    PRINT 'OrderItems: ' + CAST(@OrderItemCount AS VARCHAR)
    PRINT 'CartItems: ' + CAST(@CartItemCount AS VARCHAR)
    PRINT 'Addresses: ' + CAST(@AddressCount AS VARCHAR)
    PRINT 'Coupons: ' + CAST(@CouponCount2 AS VARCHAR)
    PRINT 'OrderStatusHistories: ' + CAST(@StatusHistoryCount AS VARCHAR)
END

PRINT ''
PRINT '=== VERIFICATION COMPLETE ==='
GO
