using OrderService.Domain.Entities;

namespace OrderService.Application.DTOs;

public class CouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CouponValidationRequest
{
    public string CouponCode { get; set; } = string.Empty;
    public decimal CartTotal { get; set; }
}

public class CouponValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public Guid? CouponId { get; set; }
}

public class CreateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; } = 0;
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int UsageLimit { get; set; } = 100;
}
