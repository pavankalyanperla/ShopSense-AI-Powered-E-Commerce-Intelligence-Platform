using SellerService.Domain.Enums;

namespace SellerService.Domain.Entities;

public class KycDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SellerId { get; set; }
    public Seller Seller { get; set; } = null!;
    public string AadhaarNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public KycVerificationStatus AadhaarStatus { get; set; } = KycVerificationStatus.Pending;
    public KycVerificationStatus PanStatus { get; set; } = KycVerificationStatus.Pending;
    public KycVerificationStatus GstStatus { get; set; } = KycVerificationStatus.Pending;
    public KycVerificationStatus BankStatus { get; set; } = KycVerificationStatus.Pending;
    public string? MockApiResponse { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? VerifiedAt { get; set; }
}
