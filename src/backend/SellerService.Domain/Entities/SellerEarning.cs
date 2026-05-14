using SellerService.Domain.Enums;

namespace SellerService.Domain.Entities;

public class SellerEarning
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SellerId { get; set; }
    public Seller Seller { get; set; } = null!;
    public Guid OrderItemId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal CommissionRate { get; set; } = 5;
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public PayoutStatus PayoutStatus { get; set; } = PayoutStatus.Pending;
    public string PeriodMonth { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
