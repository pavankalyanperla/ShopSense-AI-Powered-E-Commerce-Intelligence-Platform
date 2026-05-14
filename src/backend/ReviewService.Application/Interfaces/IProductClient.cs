namespace ReviewService.Application.Interfaces;

public interface IProductClient
{
    Task UpdateRatingAsync(Guid productId, double avgRating, int reviewCount);
    Task UpdateSentimentAsync(Guid productId, string label, double score);
}
