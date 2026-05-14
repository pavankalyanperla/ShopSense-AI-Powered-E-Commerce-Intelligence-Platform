namespace OrderService.Domain.Entities;

public class CartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
    public int MaxStock { get; set; }
    public string? SelectedVariant { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
