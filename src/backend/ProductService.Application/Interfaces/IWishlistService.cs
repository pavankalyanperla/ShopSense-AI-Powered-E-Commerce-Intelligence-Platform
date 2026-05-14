using ProductService.Application.DTOs;

namespace ProductService.Application.Interfaces;

public interface IWishlistService
{
    Task<IEnumerable<ProductDto>> GetWishlistAsync(Guid customerId);
    Task<bool> AddToWishlistAsync(Guid customerId, Guid productId);
    Task<bool> RemoveFromWishlistAsync(Guid customerId, Guid productId);
    Task<bool> IsWishlistedAsync(Guid customerId, Guid productId);
}
