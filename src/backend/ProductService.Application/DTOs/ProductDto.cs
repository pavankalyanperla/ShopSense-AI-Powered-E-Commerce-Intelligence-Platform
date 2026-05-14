namespace ProductService.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public string? SentimentLabel { get; set; }
    public double? SentimentScore { get; set; }
    public string PrimaryImageUrl { get; set; } = string.Empty;
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<ProductSpecDto> Specifications { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string VariantType { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
    public int Stock { get; set; }
}

public class ProductSpecDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
