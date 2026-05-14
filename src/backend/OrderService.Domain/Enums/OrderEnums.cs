namespace OrderService.Domain.Entities;

public enum OrderStatus
{
    Placed = 1,
    Confirmed = 2,
    Shipped = 3,
    OutForDelivery = 4,
    Delivered = 5,
    Cancelled = 6,
    ReturnRequested = 7,
    Returned = 8,
    FraudHold = 9
}

public enum PaymentMethod
{
    COD = 1,
    UPI = 2,
    DebitCard = 3,
    CreditCard = 4,
    NetBanking = 5
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4,
    RefundPending = 5
}

public enum DiscountType
{
    Percentage = 1,
    Flat = 2
}

public enum ReturnStatus
{
    Requested = 1,
    Approved = 2,
    PickupScheduled = 3,
    Received = 4,
    RefundInitiated = 5,
    Completed = 6,
    Rejected = 7
}
