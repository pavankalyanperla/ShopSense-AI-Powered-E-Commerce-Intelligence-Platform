namespace ProductService.Domain.Entities;

public class ProductImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}
