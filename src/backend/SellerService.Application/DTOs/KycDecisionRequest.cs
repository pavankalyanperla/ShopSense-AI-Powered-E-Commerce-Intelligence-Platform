namespace SellerService.Application.DTOs;

public class KycDecisionRequest
{
    public bool Approve { get; set; }
    public string? Reason { get; set; }
}
