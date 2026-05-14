namespace SellerService.Application.DTOs;

public class ListingCoachResponse
{
    public int Score { get; set; }
    public string Grade { get; set; } = string.Empty;
    public List<ImprovementItem> Improvements { get; set; } = new();
    public List<string> SuggestedKeywords { get; set; } = new();
    public CompetitorPriceAlert? PriceAlert { get; set; }
    public BestTimeToList? BestTime { get; set; }
}

public class ImprovementItem
{
    public string Category { get; set; } = string.Empty;
    public string Issue { get; set; } = string.Empty;
    public string Suggestion { get; set; } = string.Empty;
    public int Impact { get; set; }
}

public class CompetitorPriceAlert
{
    public decimal YourPrice { get; set; }
    public decimal AvgMarketPrice { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

public class BestTimeToList
{
    public string DayOfWeek { get; set; } = string.Empty;
    public string TimeRange { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
