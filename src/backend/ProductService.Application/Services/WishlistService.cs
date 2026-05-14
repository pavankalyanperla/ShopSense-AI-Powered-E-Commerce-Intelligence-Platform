using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Application.DTOs;
using ProductService.Application.Interfaces;

namespace ProductService.Application.Services;

public class WishlistService : IWishlistService
{
    private readonly IWishlistRepository _wishlist;
    private readonly IProductRepository _products;

    public WishlistService(IWishlistRepository wishlist, IProductRepository products)
    {
        _wishlist = wishlist;
        _products = products;
    }

    public async Task<IEnumerable<ProductDto>> GetWishlistAsync(Guid customerId)
    {
        var items = await _wishlist.GetByCustomerIdAsync(customerId);
        return items.Where(w => w.Product != null).Select(w => MapProductToDto(w.Product!));
    }

    public async Task<bool> AddToWishlistAsync(Guid customerId, Guid productId)
    {
        var existing = await _wishlist.GetAsync(customerId, productId);
        if (existing != null) return false;

        await _wishlist.AddAsync(new Wishlist { CustomerId = customerId, ProductId = productId });
        await _wishlist.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFromWishlistAsync(Guid customerId, Guid productId)
    {
        await _wishlist.RemoveAsync(customerId, productId);
        await _wishlist.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsWishlistedAsync(Guid customerId, Guid productId)
    {
        var item = await _wishlist.GetAsync(customerId, productId);
        return item != null;
    }

    private static ProductDto MapProductToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        BasePrice = p.BasePrice,
        DiscountedPrice = p.DiscountedPrice,
        DiscountPercent = p.DiscountPercent,
        AverageRating = p.AverageRating,
        ReviewCount = p.ReviewCount,
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? string.Empty,
        StockQuantity = p.StockQuantity,
        IsActive = p.IsActive,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        SellerId = p.SellerId,
        SellerName = p.SellerName,
        CreatedAt = p.CreatedAt,
        Description = p.Description,
        Brand = p.Brand,
        IsFeatured = p.IsFeatured,
        Images = new List<ProductImageDto>(),
        Variants = new List<ProductVariantDto>(),
        Specifications = new List<ProductSpecDto>()
    };
}
