using Microsoft.EntityFrameworkCore;
using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Infrastructure.Data;

namespace ProductService.Infrastructure.Repositories;

public class WishlistRepository : IWishlistRepository
{
    private readonly ProductDbContext _context;

    public WishlistRepository(ProductDbContext context) => _context = context;

    public async Task<IEnumerable<Wishlist>> GetByCustomerIdAsync(Guid customerId) =>
        await _context.Wishlists
            .Include(w => w.Product)
                .ThenInclude(p => p.Images)
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Where(w => w.CustomerId == customerId)
            .ToListAsync();

    public async Task<Wishlist?> GetAsync(Guid customerId, Guid productId) =>
        await _context.Wishlists
            .FirstOrDefaultAsync(w =>
                w.CustomerId == customerId && w.ProductId == productId);

    public async Task AddAsync(Wishlist wishlist) =>
        await _context.Wishlists.AddAsync(wishlist);

    public async Task RemoveAsync(Guid customerId, Guid productId)
    {
        var item = await _context.Wishlists
            .FirstOrDefaultAsync(w =>
                w.CustomerId == customerId && w.ProductId == productId);
        if (item != null) _context.Wishlists.Remove(item);
    }

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
