namespace SellerService.Application.DTOs;

public class SellerDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string KycStatus { get; set; } = string.Empty;
    public decimal TotalEarnings { get; set; }
    public DateTime RegisteredAt { get; set; }
}
