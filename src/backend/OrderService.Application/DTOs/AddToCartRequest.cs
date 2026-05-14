namespace OrderService.Application.DTOs;

public class AddToCartRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? SelectedVariant { get; set; }
}
