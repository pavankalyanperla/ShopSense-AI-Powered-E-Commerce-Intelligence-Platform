namespace ProductService.Application.DTOs;

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 10;
    public string SKU { get; set; } = string.Empty;
    public bool IsFeatured { get; set; } = false;
    public List<string> ImageUrls { get; set; } = new();
    public List<CreateVariantDto> Variants { get; set; } = new();
    public List<ProductSpecDto> Specifications { get; set; } = new();
}

public class CreateVariantDto
{
    public string VariantType { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
    public int Stock { get; set; }
}
