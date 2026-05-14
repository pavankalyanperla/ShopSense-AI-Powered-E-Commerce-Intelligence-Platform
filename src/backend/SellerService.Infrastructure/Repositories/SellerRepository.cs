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
        _context.Sellers.Update(seller);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
