namespace ProductService.Application.DTOs;

public class ProductQueryParams
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? SellerId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public bool? InStock { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public bool SortDesc { get; set; } = true;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
