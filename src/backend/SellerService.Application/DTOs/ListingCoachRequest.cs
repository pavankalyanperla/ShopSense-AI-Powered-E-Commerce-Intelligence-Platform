namespace SellerService.Application.DTOs;

public class ListingCoachRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public Dictionary<string, string> Specifications { get; set; } = new();
    public int StockQuantity { get; set; }
}
