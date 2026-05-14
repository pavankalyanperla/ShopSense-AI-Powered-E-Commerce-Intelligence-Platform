using ReviewService.Domain.Entities;

namespace ReviewService.Domain.Interfaces;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId, int page, int pageSize);
    Task<IEnumerable<Review>> GetByCustomerIdAsync(Guid customerId);
    Task<IEnumerable<Review>> GetFlaggedAsync();
    Task<Review?> GetByIdAsync(Guid id);
    Task<Review?> GetByCustomerAndProductAsync(Guid customerId, Guid productId);
    Task<(double AvgRating, int Count)> GetRatingSummaryAsync(Guid productId);
    Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid productId);
    Task AddAsync(Review review);
    Task UpdateAsync(Review review);
    Task SaveChangesAsync();
}
