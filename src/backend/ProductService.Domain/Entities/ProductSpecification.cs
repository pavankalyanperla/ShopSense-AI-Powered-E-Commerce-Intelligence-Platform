namespace ProductService.Domain.Entities;

public class ProductSpecification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
