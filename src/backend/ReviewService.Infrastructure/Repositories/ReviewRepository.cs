using Microsoft.EntityFrameworkCore;
using ReviewService.Domain.Entities;
using ReviewService.Domain.Interfaces;
using ReviewService.Infrastructure.Data;

namespace ReviewService.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly ReviewDbContext _context;

    public ReviewRepository(ReviewDbContext context) => _context = context;

    public async Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId, int page, int pageSize) =>
        await _context.Reviews
            .Include(r => r.Replies)
            .Include(r => r.Flags)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize == int.MaxValue ? int.MaxValue : pageSize)
            .ToListAsync();

    public async Task<IEnumerable<Review>> GetByCustomerIdAsync(Guid customerId) =>
        await _context.Reviews
            .Include(r => r.Replies)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Review>> GetFlaggedAsync() =>
        await _context.Reviews
            .Include(r => r.Flags)
            .Where(r => r.IsFlagged)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<Review?> GetByIdAsync(Guid id) =>
        await _context.Reviews
            .Include(r => r.Replies)
            .Include(r => r.Flags)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<Review?> GetByCustomerAndProductAsync(Guid customerId, Guid productId) =>
        await _context.Reviews
            .FirstOrDefaultAsync(r => r.CustomerId == customerId && r.ProductId == productId);

    public async Task<(double AvgRating, int Count)> GetRatingSummaryAsync(Guid productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .ToListAsync();
        
        if (!reviews.Any()) return (0, 0);
        return (reviews.Average(r => r.Rating), reviews.Count);
    }

    public async Task<Dictionary<int, int>> GetRatingDistributionAsync(Guid productId)
    {
        var dist = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .ToListAsync();

        var result = new Dictionary<int, int> { {1,0},{2,0},{3,0},{4,0},{5,0} };
        foreach (var d in dist) result[d.Rating] = d.Count;
        return result;
    }

    public async Task AddAsync(Review review) => await _context.Reviews.AddAsync(review);

    public Task UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
}
