using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Data;

namespace OrderService.Infrastructure.Repositories;

public class CouponRepository : ICouponRepository
{
    private readonly OrderDbContext _context;

    public CouponRepository(OrderDbContext context)
    {
        _context = context;
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code.ToUpper());
    }

    public async Task<IEnumerable<Coupon>> GetAllAsync()
    {
        return await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Coupon>> GetActiveCouponsAsync()
    {
        return await _context.Coupons
            .Where(c => c.IsActive && c.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Coupon coupon)
    {
        await _context.Coupons.AddAsync(coupon);
        await _context.SaveChangesAsync();
    }

    public async Task CreateAsync(Coupon coupon)
    {
        await _context.Coupons.AddAsync(coupon);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Coupon coupon)
    {
        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
