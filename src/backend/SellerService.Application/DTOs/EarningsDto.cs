namespace SellerService.Application.DTOs;

public class EarningsDto
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public decimal Commission { get; set; }
    public decimal NetAmount { get; set; }
    public string PayoutStatus { get; set; } = string.Empty;
    public DateTime? PayoutDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
