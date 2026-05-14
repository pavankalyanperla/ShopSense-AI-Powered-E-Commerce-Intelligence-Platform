using ReviewService.Application.DTOs;

namespace ReviewService.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(CreateReviewRequest request, Guid customerId, string customerName);
    Task<IEnumerable<ReviewDto>> GetByProductAsync(Guid productId, int page, int pageSize);
    Task<IEnumerable<ReviewDto>> GetByCustomerAsync(Guid customerId);
    Task<RatingSummaryDto> GetRatingSummaryAsync(Guid productId);
    Task<ReviewDto?> AddReplyAsync(Guid reviewId, Guid sellerId, string sellerName, AddReplyRequest request);
    Task<bool> FlagReviewAsync(Guid reviewId, Guid flaggedBy, FlagReviewRequest request);
    Task<IEnumerable<ReviewDto>> GetFlaggedAsync();
    Task<bool> ModerateAsync(Guid reviewId, bool approve);
}
