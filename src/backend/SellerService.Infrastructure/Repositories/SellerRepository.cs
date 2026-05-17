using Microsoft.EntityFrameworkCore;
using SellerService.Domain.Entities;
using SellerService.Domain.Enums;
using SellerService.Domain.Interfaces;
using SellerService.Infrastructure.Data;

namespace SellerService.Infrastructure.Repositories;

public class SellerRepository : ISellerRepository
{
    private readonly SellerDbContext _context;

    public SellerRepository(SellerDbContext context)
    {
        _context = context;
    }

    public async Task<Seller?> GetByIdAsync(Guid id)
    {
        return await _context.Sellers
            .Include(s => s.KycDocument)
            .Include(s => s.Earnings)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Seller?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Sellers
            .Include(s => s.KycDocument)
            .Include(s => s.Earnings)
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<IEnumerable<Seller>> GetAllAsync(SellerStatus? status)
    {
        var query = _context.Sellers
            .Include(s => s.KycDocument)
            .Include(s => s.Earnings)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid userId)
    {
        return await _context.Sellers.AnyAsync(s => s.UserId == userId);
    }

    public async Task AddAsync(Seller seller)
    {
        await _context.Sellers.AddAsync(seller);
    }

    public async Task UpdateAsync(Seller seller)
    {
        _context.Entry(seller).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
        await Task.CompletedTask;
    }

    public async Task SubmitKycDocumentAsync(Guid sellerId, KycDocument kycDoc, SellerStatus newStatus, string? rejectionReason, DateTime? approvedAt)
    {
        await _context.Sellers
            .Where(s => s.Id == sellerId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, newStatus)
                .SetProperty(x => x.RejectionReason, rejectionReason)
                .SetProperty(x => x.ApprovedAt, approvedAt)
                .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));
        await _context.KycDocuments.AddAsync(kycDoc);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
