namespace ProductService.Domain.Entities;

public class Wishlist
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
