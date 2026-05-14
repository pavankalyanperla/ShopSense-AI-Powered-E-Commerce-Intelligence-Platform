using ReviewService.Domain.Entities;
using ReviewService.Domain.Enums;
using ReviewService.Domain.Interfaces;
using ReviewService.Application.DTOs;
using ReviewService.Application.Interfaces;

namespace ReviewService.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviews;
    private readonly ISentimentClient _sentiment;
    private readonly IProductClient _productClient;

    public ReviewService(IReviewRepository reviews, ISentimentClient sentiment, IProductClient productClient)
    {
        _reviews = reviews;
        _sentiment = sentiment;
        _productClient = productClient;
    }

    public async Task<ReviewDto> CreateAsync(CreateReviewRequest request, Guid customerId, string customerName)
    {
        // One review per customer per product
        var existing = await _reviews.GetByCustomerAndProductAsync(customerId, request.ProductId);
        if (existing != null)
            throw new InvalidOperationException("You have already reviewed this product");

        // Analyze sentiment via Python ML service
        var (label, score) = await _sentiment.AnalyzeAsync(request.Title + " " + request.Body);

        var review = new Review
        {
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            CustomerId = customerId,
            CustomerName = customerName,
            OrderId = request.OrderId,
            Rating = Math.Clamp(request.Rating, 1, 5),
            Title = request.Title,
            Body = request.Body,
            SentimentLabel = label.ToUpper() switch
            {
                "POSITIVE" => SentimentLabel.Positive,
                "NEGATIVE" => SentimentLabel.Negative,
                _ => SentimentLabel.Neutral
            },
            SentimentScore = score
        };

        await _reviews.AddAsync(review);
        await _reviews.SaveChangesAsync();

        // Update product rating and sentiment in ProductService
        var summary = await _reviews.GetRatingSummaryAsync(request.ProductId);
        await _productClient.UpdateRatingAsync(request.ProductId, summary.AvgRating, summary.Count);
        await _productClient.UpdateSentimentAsync(request.ProductId, label, score);

        return MapToDto(review);
    }

    public async Task<IEnumerable<ReviewDto>> GetByProductAsync(Guid productId, int page, int pageSize)
    {
        var reviews = await _reviews.GetByProductIdAsync(productId, page, pageSize);
        return reviews.Select(MapToDto);
    }

    public async Task<IEnumerable<ReviewDto>> GetByCustomerAsync(Guid customerId)
    {
        var reviews = await _reviews.GetByCustomerIdAsync(customerId);
        return reviews.Select(MapToDto);
    }

    public async Task<RatingSummaryDto> GetRatingSummaryAsync(Guid productId)
    {
        var (avg, count) = await _reviews.GetRatingSummaryAsync(productId);
        var dist = await _reviews.GetRatingDistributionAsync(productId);
        var reviews = await _reviews.GetByProductIdAsync(productId, 1, int.MaxValue);
        var list = reviews.ToList();

        return new RatingSummaryDto
        {
            ProductId = productId,
            AverageRating = Math.Round(avg, 1),
            TotalReviews = count,
            Distribution = dist,
            PositiveCount = list.Count(r => r.SentimentLabel == SentimentLabel.Positive),
            NeutralCount = list.Count(r => r.SentimentLabel == SentimentLabel.Neutral),
            NegativeCount = list.Count(r => r.SentimentLabel == SentimentLabel.Negative)
        };
    }

    public async Task<ReviewDto?> AddReplyAsync(Guid reviewId, Guid sellerId, string sellerName, AddReplyRequest request)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review == null) return null;

        review.Replies.Add(new ReviewReply
        {
            ReviewId = reviewId,
            SellerId = sellerId,
            SellerName = sellerName,
            ReplyText = request.ReplyText
        });

        await _reviews.UpdateAsync(review);
        await _reviews.SaveChangesAsync();
        return MapToDto(review);
    }

    public async Task<bool> FlagReviewAsync(Guid reviewId, Guid flaggedBy, FlagReviewRequest request)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review == null) return false;

        review.Flags.Add(new ReviewFlag
        {
            ReviewId = reviewId,
            FlaggedBy = flaggedBy,
            Reason = request.Reason
        });
        review.IsFlagged = true;

        await _reviews.UpdateAsync(review);
        await _reviews.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<ReviewDto>> GetFlaggedAsync()
    {
        var reviews = await _reviews.GetFlaggedAsync();
        return reviews.Select(MapToDto);
    }

    public async Task<bool> ModerateAsync(Guid reviewId, bool approve)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review == null) return false;

        review.IsApproved = approve;
        review.IsFlagged = false;
        if (!approve) review.UpdatedAt = DateTime.UtcNow;

        await _reviews.UpdateAsync(review);
        await _reviews.SaveChangesAsync();
        return true;
    }

    private static ReviewDto MapToDto(Review r) => new()
    {
        Id = r.Id,
        ProductId = r.ProductId,
        ProductName = r.ProductName,
        CustomerId = r.CustomerId,
        CustomerName = r.CustomerName,
        Rating = r.Rating,
        Title = r.Title,
        Body = r.Body,
        SentimentLabel = r.SentimentLabel.ToString(),
        SentimentScore = r.SentimentScore,
        IsVerifiedPurchase = r.IsVerifiedPurchase,
        IsFlagged = r.IsFlagged,
        Replies = r.Replies.Select(rp => new ReviewReplyDto
        {
            Id = rp.Id,
            SellerId = rp.SellerId,
            SellerName = rp.SellerName,
            ReplyText = rp.ReplyText,
            CreatedAt = rp.CreatedAt
        }).ToList(),
        CreatedAt = r.CreatedAt
    };
}
