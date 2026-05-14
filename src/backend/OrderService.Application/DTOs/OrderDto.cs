using OrderService.Domain.Entities;

namespace OrderService.Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal TotalAmount { get; set; }
    public string? CouponCode { get; set; }
    public double? FraudScore { get; set; }
    public bool IsFraudFlagged { get; set; }
    public AddressDto DeliveryAddress { get; set; } = null!;
    public List<OrderItemDto> Items { get; set; } = new();
    public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}

public class OrderItemDto
{
    public Guid Id { get; set; }
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

public class OrderStatusHistoryDto
{
    public Guid Id { get; set; }
    public OrderStatus Status { get; set; }
    public string? Remarks { get; set; }
    public DateTime ChangedAt { get; set; }
}
