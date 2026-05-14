namespace ProductService.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public int StockQuantity { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 10;
    public string SKU { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public string? SentimentLabel { get; set; }
    public double? SentimentScore { get; set; }
    public string? RecommendedPrice { get; set; }
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
