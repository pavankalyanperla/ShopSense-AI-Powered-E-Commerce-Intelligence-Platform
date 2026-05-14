using OrderService.Application.DTOs;

namespace OrderService.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid customerId);
    Task<CartDto> AddToCartAsync(Guid customerId, AddToCartRequest request);
    Task<CartDto> UpdateCartItemAsync(Guid customerId, Guid cartItemId, int quantity);
    Task<bool> RemoveFromCartAsync(Guid customerId, Guid cartItemId);
    Task<bool> ClearCartAsync(Guid customerId);
}
