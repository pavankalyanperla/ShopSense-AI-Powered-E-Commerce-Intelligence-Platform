namespace NotificationService.Application.Messages;

public class KycDecisionMessage
{
    public Guid SellerId { get; set; }
    public string SellerEmail { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public string? Reason { get; set; }
    public DateTime DecidedAt { get; set; }
}
