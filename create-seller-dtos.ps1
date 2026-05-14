# Create remaining SellerService DTOs
$ErrorActionPreference = "Stop"

@"
namespace SellerService.Application.DTOs;

public class SellerDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string? SuspensionReason { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal PendingPayout { get; set; }
    public KycDocumentDto? KycDocument { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
}

public class KycDocumentDto
{
    public string AadhaarNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AadhaarStatus { get; set; } = string.Empty;
    public string PanStatus { get; set; } = string.Empty;
    public string GstStatus { get; set; } = string.Empty;
    public string BankStatus { get; set; } = string.Empty;
    public string? MockApiResponse { get; set; }
    public DateTime SubmittedAt { get; set; }
}
"@ | Out-File -FilePath "src/backend/SellerService.Application/DTOs/SellerDto.cs" -Encoding UTF8

@"
namespace SellerService.Application.DTOs;

public class EarningsDto
{
    public decimal TotalEarnings { get; set; }
    public decimal PendingPayout { get; set; }
    public decimal ThisMonthEarnings { get; set; }
    public List<EarningItemDto> Transactions { get; set; } = new();
}

public class EarningItemDto
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string PayoutStatus { get; set; } = string.Empty;
    public string PeriodMonth { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
"@ | Out-File -FilePath "src/backend/SellerService.Application/DTOs/EarningsDto.cs" -Encoding UTF8

Write-Host "SellerDto and EarningsDto created" -ForegroundColor Green
