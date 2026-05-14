namespace SellerService.Domain.Enums;

public enum SellerStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Suspended = 4
}

public enum KycVerificationStatus
{
    Pending = 1,
    Verified = 2,
    Failed = 3
}

public enum PayoutStatus
{
    Pending = 1,
    Processing = 2,
    Paid = 3,
    Failed = 4
}
