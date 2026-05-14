using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces;

public interface ICartRepository
{
    Task<IEnumerable<CartItem>> GetByCustomerIdAsync(Guid customerId);
    Task<CartItem?> GetItemAsync(Guid customerId, Guid productId);
    Task AddAsync(CartItem item);
    Task UpdateAsync(CartItem item);
    Task RemoveAsync(Guid customerId, Guid productId);
    Task ClearAsync(Guid customerId);
    Task SaveChangesAsync();
}
