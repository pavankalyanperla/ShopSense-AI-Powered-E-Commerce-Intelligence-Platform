namespace NotificationService.Application.Messages;

public class FraudCheckMessage
{
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
}
