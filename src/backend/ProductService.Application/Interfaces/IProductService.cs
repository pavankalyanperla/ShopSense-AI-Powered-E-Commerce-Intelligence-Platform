using ProductService.Application.DTOs;

namespace ProductService.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query);
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<ProductDto?> GetBySlugAsync(string slug);
    Task<IEnumerable<ProductDto>> GetFeaturedAsync(int count = 10);
    Task<IEnumerable<ProductDto>> GetBySellerAsync(Guid sellerId);
    Task<IEnumerable<ProductDto>> GetLowStockAsync();
    Task<ProductDto> CreateAsync(CreateProductRequest request, Guid sellerId, string sellerName);
    Task<ProductDto?> UpdateAsync(Guid id, UpdateProductRequest request, Guid sellerId);
    Task<bool> DeleteAsync(Guid id, Guid sellerId);
    Task UpdateSentimentAsync(Guid productId, string label, double score);
    Task UpdateRatingAsync(Guid productId, double avgRating, int reviewCount);
    Task UpdateRecommendedPriceAsync(Guid productId, string price);
}
