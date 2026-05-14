using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Data;

namespace OrderService.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly OrderDbContext _context;

    public CartRepository(OrderDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CartItem>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.CartItems
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.AddedAt)
            .ToListAsync();
    }

    public async Task<List<CartItem>> GetCartItemsByCustomerIdAsync(Guid customerId)
    {
        return await _context.CartItems
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.AddedAt)
            .ToListAsync();
    }

    public async Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId)
    {
        return await _context.CartItems.FindAsync(cartItemId);
    }

    public async Task<CartItem?> GetItemAsync(Guid customerId, Guid productId)
    {
        return await _context.CartItems
            .FirstOrDefaultAsync(x => x.CustomerId == customerId && x.ProductId == productId);
    }

    public async Task<CartItem?> GetCartItemByProductIdAsync(Guid customerId, Guid productId, string? selectedVariant)
    {
        return await _context.CartItems
            .FirstOrDefaultAsync(x => x.CustomerId == customerId 
                && x.ProductId == productId 
                && x.SelectedVariant == selectedVariant);
    }

    public async Task AddAsync(CartItem item)
    {
        await _context.CartItems.AddAsync(item);
        await _context.SaveChangesAsync();
    }

    public async Task AddCartItemAsync(CartItem item)
    {
        await _context.CartItems.AddAsync(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CartItem item)
    {
        _context.CartItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateCartItemAsync(CartItem item)
    {
        _context.CartItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid customerId, Guid productId)
    {
        var item = await GetItemAsync(customerId, productId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteCartItemAsync(Guid cartItemId)
    {
        var item = await _context.CartItems.FindAsync(cartItemId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearAsync(Guid customerId)
    {
        var items = await _context.CartItems
            .Where(x => x.CustomerId == customerId)
            .ToListAsync();
        
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }

    public async Task ClearCartAsync(Guid customerId)
    {
        var items = await _context.CartItems
            .Where(x => x.CustomerId == customerId)
            .ToListAsync();
        
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
