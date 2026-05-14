namespace ReviewService.Application.DTOs;

public class RatingSummaryDto
{
    public Guid ProductId { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public Dictionary<int, int> Distribution { get; set; } = new();
    public int PositiveCount { get; set; }
    public int NeutralCount { get; set; }
    public int NegativeCount { get; set; }
}
