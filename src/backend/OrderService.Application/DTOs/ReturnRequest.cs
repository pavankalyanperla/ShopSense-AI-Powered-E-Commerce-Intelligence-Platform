namespace OrderService.Application.DTOs;

public class ReturnRequest
{
    public Guid OrderItemId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
