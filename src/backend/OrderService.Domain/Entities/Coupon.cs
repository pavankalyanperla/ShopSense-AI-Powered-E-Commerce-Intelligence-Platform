namespace OrderService.Domain.Entities;

public class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; } = 0;
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int UsageLimit { get; set; } = 100;
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
