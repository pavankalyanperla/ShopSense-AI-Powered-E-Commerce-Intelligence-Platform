namespace NotificationService.Application.Messages;

public class OrderPlacedMessage
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public List<OrderItemMessage> Items { get; set; } = new();
    public OrderAddressMessage DeliveryAddress { get; set; } = new();
    public DateTime PlacedAt { get; set; }
}

public class OrderItemMessage
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal FinalPrice { get; set; }
}

public class OrderAddressMessage
{
    public string FullName { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
}
