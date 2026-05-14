namespace OrderService.Application.DTOs;

public class CartDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public int MaxStock { get; set; }
    public decimal ItemTotal { get; set; }
    public string? SelectedVariant { get; set; }
}
