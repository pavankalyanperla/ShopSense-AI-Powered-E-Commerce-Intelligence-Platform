namespace OrderService.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal DeliveryCharge { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public Guid? CouponId { get; set; }
    public string? CouponCode { get; set; }
    public double? FraudScore { get; set; }
    public bool IsFraudFlagged { get; set; } = false;
    public Guid DeliveryAddressId { get; set; }
    public Address DeliveryAddress { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}
