namespace ProductService.Application.DTOs;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
}
