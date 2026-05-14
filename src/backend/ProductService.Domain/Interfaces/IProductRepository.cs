using ProductService.Domain.Entities;

namespace ProductService.Domain.Interfaces;

public interface IProductRepository
{
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        string? search, Guid? categoryId, Guid? sellerId,
        decimal? minPrice, decimal? maxPrice,
        double? minRating, bool? inStock,
        string sortBy, bool sortDesc,
        int page, int pageSize);
    Task<Product?> GetByIdAsync(Guid id);
    Task<Product?> GetBySlugAsync(string slug);
    Task<IEnumerable<Product>> GetBySellerIdAsync(Guid sellerId);
    Task<IEnumerable<Product>> GetFeaturedAsync(int count = 10);
    Task<IEnumerable<Product>> GetLowStockAsync(int threshold = 10);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(Guid id);
    Task SaveChangesAsync();
}
