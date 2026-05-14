using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProductService.Domain.Entities;

namespace ProductService.Infrastructure.Data;

public static class ProductDbSeeder
{
    public static async Task SeedAsync(ProductDbContext context, ILogger logger)
    {
        if (await context.Categories.AnyAsync())
        {
            logger.LogInformation("Database already seeded — skipping.");
            return;
        }

        logger.LogInformation("Seeding ShopSense product database with Indian categories and products...");

        // ── Indian E-Commerce Categories ──
        var electronics = new Category
        {
            Name = "Electronics",
            Slug = "electronics",
            DisplayOrder = 1,
            Description = "Mobiles, laptops, tablets, cameras and accessories",
            ImageUrl = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"
        };

        var fashion = new Category
        {
            Name = "Fashion",
            Slug = "fashion",
            DisplayOrder = 2,
            Description = "Clothing, footwear and accessories for men, women and kids",
            ImageUrl = "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"
        };

        var homeKitchen = new Category
        {
            Name = "Home & Kitchen",
            Slug = "home-kitchen",
            DisplayOrder = 3,
            Description = "Furniture, appliances, cookware and home decor",
            ImageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
        };

        var beauty = new Category
        {
            Name = "Beauty & Personal Care",
            Slug = "beauty-personal-care",
            DisplayOrder = 4,
            Description = "Skincare, haircare, makeup and grooming",
            ImageUrl = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400"
        };

        var sports = new Category
        {
            Name = "Sports & Fitness",
            Slug = "sports-fitness",
            DisplayOrder = 5,
            Description = "Exercise equipment, sportswear and outdoor gear",
            ImageUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400"
        };

        var books = new Category
        {
            Name = "Books",
            Slug = "books",
            DisplayOrder = 6,
            Description = "Fiction, non-fiction, textbooks and more",
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
        };

        var grocery = new Category
        {
            Name = "Grocery & Gourmet",
            Slug = "grocery-gourmet",
            DisplayOrder = 7,
            Description = "Staples, snacks, beverages and organic food",
            ImageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"
        };

        var toys = new Category
        {
            Name = "Toys & Baby",
            Slug = "toys-baby",
            DisplayOrder = 8,
            Description = "Toys, games, baby care and nursery products",
            ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
        };

        // Sub-categories for Electronics
        var mobiles = new Category
        {
            Name = "Mobiles",
            Slug = "mobiles",
            ParentCategory = electronics,
            DisplayOrder = 1
        };

        var laptops = new Category
        {
            Name = "Laptops",
            Slug = "laptops",
            ParentCategory = electronics,
            DisplayOrder = 2
        };

        var earphones = new Category
        {
            Name = "Earphones & Headphones",
            Slug = "earphones-headphones",
            ParentCategory = electronics,
            DisplayOrder = 3
        };

        var cameras = new Category
        {
            Name = "Cameras",
            Slug = "cameras",
            ParentCategory = electronics,
            DisplayOrder = 4
        };

        // Sub-categories for Fashion
        var menClothing = new Category
        {
            Name = "Men's Clothing",
            Slug = "mens-clothing",
            ParentCategory = fashion,
            DisplayOrder = 1
        };

        var womenClothing = new Category
        {
            Name = "Women's Clothing",
            Slug = "womens-clothing",
            ParentCategory = fashion,
            DisplayOrder = 2
        };

        var footwear = new Category
        {
            Name = "Footwear",
            Slug = "footwear",
            ParentCategory = fashion,
            DisplayOrder = 3
        };

        var allCategories = new List<Category>
        {
            electronics, fashion, homeKitchen, beauty, sports, books, grocery, toys,
            mobiles, laptops, earphones, cameras, menClothing, womenClothing, footwear
        };

        await context.Categories.AddRangeAsync(allCategories);
        await context.SaveChangesAsync();

        // ── Seed Products (representative Indian e-commerce catalog) ──
        var systemSellerId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        var products = new List<Product>
        {
            // Mobiles
            new Product
            {
                Name = "Samsung Galaxy S24 Ultra 5G",
                Slug = "samsung-galaxy-s24-ultra-5g-001",
                Description = "12GB RAM, 256GB Storage, 200MP Camera, AI-powered features, IP68 water resistant. The ultimate Android flagship for 2024.",
                Brand = "Samsung",
                CategoryId = mobiles.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 129999,
                DiscountedPrice = 119999,
                DiscountPercent = 7.7m,
                StockQuantity = 50,
                SKU = "SS-SAMS24U-001",
                IsFeatured = true,
                AverageRating = 4.7,
                ReviewCount = 2341,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600", IsPrimary = true, DisplayOrder = 0 }
                },
                Specifications = new List<ProductSpecification>
                {
                    new() { Key = "RAM", Value = "12GB" },
                    new() { Key = "Storage", Value = "256GB" },
                    new() { Key = "Camera", Value = "200MP + 12MP + 10MP + 10MP" },
                    new() { Key = "Battery", Value = "5000mAh" },
                    new() { Key = "Display", Value = "6.8 inch QHD+ Dynamic AMOLED 2X" },
                    new() { Key = "Processor", Value = "Snapdragon 8 Gen 3" }
                }
            },
            new Product
            {
                Name = "OnePlus 12R 5G",
                Slug = "oneplus-12r-5g-001",
                Description = "Snapdragon 8 Gen 2, 16GB RAM, 256GB, 100W SUPERVOOC charging. The performance powerhouse under 45K.",
                Brand = "OnePlus",
                CategoryId = mobiles.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 43999,
                DiscountedPrice = 39999,
                DiscountPercent = 9.1m,
                StockQuantity = 120,
                SKU = "SS-OP12R-001",
                IsFeatured = true,
                AverageRating = 4.5,
                ReviewCount = 1876,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            new Product
            {
                Name = "Redmi Note 13 Pro+ 5G",
                Slug = "redmi-note-13-pro-plus-5g-001",
                Description = "200MP Light Hunter Camera, 120W HyperCharge, 5000mAh battery. Best camera phone under 30K.",
                Brand = "Redmi",
                CategoryId = mobiles.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 31999,
                DiscountedPrice = 27999,
                DiscountPercent = 12.5m,
                StockQuantity = 200,
                SKU = "SS-RDN13P-001",
                AverageRating = 4.4,
                ReviewCount = 3210,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Laptops
            new Product
            {
                Name = "Apple MacBook Air M2",
                Slug = "apple-macbook-air-m2-001",
                Description = "Apple M2 chip, 8GB Unified Memory, 256GB SSD, 13.6-inch Liquid Retina display, 18-hour battery life.",
                Brand = "Apple",
                CategoryId = laptops.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 114900,
                DiscountedPrice = 104900,
                DiscountPercent = 8.7m,
                StockQuantity = 35,
                SKU = "SS-MBAM2-001",
                IsFeatured = true,
                AverageRating = 4.8,
                ReviewCount = 987,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", IsPrimary = true, DisplayOrder = 0 }
                },
                Specifications = new List<ProductSpecification>
                {
                    new() { Key = "Processor", Value = "Apple M2 8-core CPU" },
                    new() { Key = "RAM", Value = "8GB Unified Memory" },
                    new() { Key = "Storage", Value = "256GB SSD" },
                    new() { Key = "Display", Value = "13.6-inch Liquid Retina" },
                    new() { Key = "Battery", Value = "Up to 18 hours" },
                    new() { Key = "Weight", Value = "1.24 kg" }
                }
            },
            new Product
            {
                Name = "HP Pavilion 15 Gaming Laptop",
                Slug = "hp-pavilion-15-gaming-001",
                Description = "Intel Core i5-12500H, NVIDIA RTX 3050, 16GB DDR5 RAM, 512GB NVMe SSD, 144Hz FHD display.",
                Brand = "HP",
                CategoryId = laptops.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 72990,
                DiscountedPrice = 64990,
                DiscountPercent = 11.0m,
                StockQuantity = 45,
                SKU = "SS-HPP15G-001",
                AverageRating = 4.3,
                ReviewCount = 654,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Earphones
            new Product
            {
                Name = "Sony WH-1000XM5 Wireless Headphones",
                Slug = "sony-wh1000xm5-001",
                Description = "Industry-leading noise cancelling, 30-hour battery, Crystal clear hands-free calling. Best-in-class ANC headphones.",
                Brand = "Sony",
                CategoryId = earphones.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 29990,
                DiscountedPrice = 23990,
                DiscountPercent = 20.0m,
                StockQuantity = 80,
                SKU = "SS-SXMH5-001",
                IsFeatured = true,
                AverageRating = 4.8,
                ReviewCount = 1543,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            new Product
            {
                Name = "boAt Airdopes 141 TWS Earbuds",
                Slug = "boat-airdopes-141-001",
                Description = "42H total playback, BEAST Mode gaming, IPX4 water resistance. India's #1 TWS earbuds brand.",
                Brand = "boAt",
                CategoryId = earphones.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 1999,
                DiscountedPrice = 1299,
                DiscountPercent = 35.0m,
                StockQuantity = 500,
                SKU = "SS-BOAT141-001",
                AverageRating = 4.1,
                ReviewCount = 8764,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Fashion
            new Product
            {
                Name = "Levi's 511 Slim Fit Jeans",
                Slug = "levis-511-slim-fit-jeans-001",
                Description = "Classic slim fit, mid rise, sits below waist. Authentic Levi's quality with stretch technology for all-day comfort.",
                Brand = "Levi's",
                CategoryId = menClothing.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 3999,
                DiscountedPrice = 2799,
                DiscountPercent = 30.0m,
                StockQuantity = 250,
                SKU = "SS-LEV511-001",
                AverageRating = 4.4,
                ReviewCount = 2109,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", IsPrimary = true, DisplayOrder = 0 }
                },
                Variants = new List<ProductVariant>
                {
                    new() { VariantType = "Size", VariantValue = "30", AdditionalPrice = 0, Stock = 50 },
                    new() { VariantType = "Size", VariantValue = "32", AdditionalPrice = 0, Stock = 80 },
                    new() { VariantType = "Size", VariantValue = "34", AdditionalPrice = 0, Stock = 70 },
                    new() { VariantType = "Size", VariantValue = "36", AdditionalPrice = 0, Stock = 50 }
                }
            },
            new Product
            {
                Name = "Fabindia Kurta for Women",
                Slug = "fabindia-womens-kurta-001",
                Description = "Pure cotton handloom kurta with traditional block print. Soft, breathable fabric perfect for Indian summers.",
                Brand = "Fabindia",
                CategoryId = womenClothing.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 2490,
                DiscountedPrice = 1990,
                DiscountPercent = 20.1m,
                StockQuantity = 180,
                SKU = "SS-FABKW-001",
                AverageRating = 4.5,
                ReviewCount = 876,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1594938298603-c8148c4b4857?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Sports
            new Product
            {
                Name = "Nike Air Max 270 Running Shoes",
                Slug = "nike-air-max-270-001",
                Description = "React foam midsole with Air Max 270 unit provides all-day cushioning. Breathable mesh upper for ventilation.",
                Brand = "Nike",
                CategoryId = footwear.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 12995,
                DiscountedPrice = 9999,
                DiscountPercent = 23.1m,
                StockQuantity = 90,
                SKU = "SS-NKAM270-001",
                IsFeatured = true,
                AverageRating = 4.6,
                ReviewCount = 1432,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", IsPrimary = true, DisplayOrder = 0 }
                },
                Variants = new List<ProductVariant>
                {
                    new() { VariantType = "Size (UK)", VariantValue = "7", AdditionalPrice = 0, Stock = 20 },
                    new() { VariantType = "Size (UK)", VariantValue = "8", AdditionalPrice = 0, Stock = 30 },
                    new() { VariantType = "Size (UK)", VariantValue = "9", AdditionalPrice = 0, Stock = 25 },
                    new() { VariantType = "Size (UK)", VariantValue = "10", AdditionalPrice = 0, Stock = 15 }
                }
            },
            // Home & Kitchen
            new Product
            {
                Name = "Prestige Svachh Pressure Cooker 5L",
                Slug = "prestige-svachh-pressure-cooker-5l-001",
                Description = "Anti-surge lid prevents food from blocking the vent tube. 5-litre capacity ideal for a family of 4-5.",
                Brand = "Prestige",
                CategoryId = homeKitchen.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 2995,
                DiscountedPrice = 2295,
                DiscountPercent = 23.4m,
                StockQuantity = 300,
                SKU = "SS-PRESC5-001",
                AverageRating = 4.5,
                ReviewCount = 5621,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Beauty
            new Product
            {
                Name = "Mamaearth Vitamin C Face Serum",
                Slug = "mamaearth-vitc-face-serum-001",
                Description = "10% Vitamin C with Turmeric for skin brightening. Dermatologically tested, toxin-free formula.",
                Brand = "Mamaearth",
                CategoryId = beauty.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 599,
                DiscountedPrice = 449,
                DiscountPercent = 25.0m,
                StockQuantity = 400,
                SKU = "SS-MMHVCS-001",
                AverageRating = 4.3,
                ReviewCount = 4312,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Books
            new Product
            {
                Name = "Atomic Habits by James Clear",
                Slug = "atomic-habits-james-clear-001",
                Description = "An Easy & Proven Way to Build Good Habits & Break Bad Ones. International bestseller with 10M+ copies sold.",
                Brand = "Penguin Random House",
                CategoryId = books.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 599,
                DiscountedPrice = 359,
                DiscountPercent = 40.1m,
                StockQuantity = 1000,
                SKU = "SS-ATOMH-001",
                AverageRating = 4.9,
                ReviewCount = 12453,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            new Product
            {
                Name = "The Psychology of Money",
                Slug = "psychology-of-money-001",
                Description = "Morgan Housel's timeless lessons on wealth, greed, and happiness. Essential reading for every Indian investor.",
                Brand = "Jaico Publishing",
                CategoryId = books.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 399,
                DiscountedPrice = 279,
                DiscountPercent = 30.1m,
                StockQuantity = 800,
                SKU = "SS-PSYMON-001",
                AverageRating = 4.8,
                ReviewCount = 8921,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            },
            // Grocery
            new Product
            {
                Name = "Tata Salt Iodised 1kg",
                Slug = "tata-salt-iodised-1kg-001",
                Description = "India's most trusted salt brand. Vacuum evaporated, free-flowing iodised salt.",
                Brand = "Tata Salt",
                CategoryId = grocery.Id,
                SellerId = systemSellerId,
                SellerName = "ShopSense Official",
                BasePrice = 28,
                DiscountedPrice = 24,
                DiscountPercent = 14.3m,
                StockQuantity = 2000,
                SKU = "SS-TATSAL-001",
                AverageRating = 4.7,
                ReviewCount = 15678,
                Images = new List<ProductImage>
                {
                    new() { ImageUrl = "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600", IsPrimary = true, DisplayOrder = 0 }
                }
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        logger.LogInformation($"Seeded {allCategories.Count} categories and {products.Count} products.");
    }
}
