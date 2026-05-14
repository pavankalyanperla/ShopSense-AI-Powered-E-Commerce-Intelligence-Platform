namespace ProductService.Domain.Entities;

public class ProductVariant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string VariantType { get; set; } = string.Empty;
    public string VariantValue { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; } = 0;
    public int Stock { get; set; } = 0;
    public string? SKU { get; set; }
}
