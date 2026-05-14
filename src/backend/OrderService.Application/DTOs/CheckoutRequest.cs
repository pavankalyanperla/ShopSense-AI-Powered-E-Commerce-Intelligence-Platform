using OrderService.Domain.Entities;

namespace OrderService.Application.DTOs;

public class CheckoutRequest
{
    public Guid DeliveryAddressId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? CouponCode { get; set; }
}
