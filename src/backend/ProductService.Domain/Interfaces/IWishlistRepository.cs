using ProductService.Domain.Entities;

namespace ProductService.Domain.Interfaces;

public interface IWishlistRepository
{
    Task<IEnumerable<Wishlist>> GetByCustomerIdAsync(Guid customerId);
    Task<Wishlist?> GetAsync(Guid customerId, Guid productId);
    Task AddAsync(Wishlist wishlist);
    Task RemoveAsync(Guid customerId, Guid productId);
    Task SaveChangesAsync();
}
