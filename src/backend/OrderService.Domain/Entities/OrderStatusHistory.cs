namespace OrderService.Domain.Entities;

public class OrderStatusHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public OrderStatus Status { get; set; }
    public string? Note { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string ChangedBy { get; set; } = string.Empty;
}
