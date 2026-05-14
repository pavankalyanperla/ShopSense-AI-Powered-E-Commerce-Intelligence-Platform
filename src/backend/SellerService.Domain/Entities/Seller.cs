using SellerService.Domain.Enums;

namespace SellerService.Domain.Entities;

public class Seller
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public SellerStatus Status { get; set; } = SellerStatus.Pending;
    public string? RejectionReason { get; set; }
    public string? SuspensionReason { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public decimal TotalEarnings { get; set; } = 0;
    public decimal PendingPayout { get; set; } = 0;
    public KycDocument? KycDocument { get; set; }
    public ICollection<SellerEarning> Earnings { get; set; } = new List<SellerEarning>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
