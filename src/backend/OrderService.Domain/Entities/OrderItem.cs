namespace OrderService.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public string? SelectedVariant { get; set; }
    public ReturnStatus? ReturnStatus { get; set; }
    public string? ReturnReason { get; set; }
    public DateTime? ReturnRequestedAt { get; set; }
}
