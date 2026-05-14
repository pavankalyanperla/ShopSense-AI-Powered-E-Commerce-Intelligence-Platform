using Microsoft.EntityFrameworkCore;
using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Infrastructure.Data;

namespace ProductService.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ProductDbContext _context;

    public ProductRepository(ProductDbContext context) => _context = context;

    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        string? search, Guid? categoryId, Guid? sellerId,
        decimal? minPrice, decimal? maxPrice, double? minRating,
        bool? inStock, string sortBy, bool sortDesc, int page, int pageSize)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p =>
                p.Name.Contains(search) ||
                p.Brand.Contains(search) ||
                p.Description.Contains(search));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (sellerId.HasValue)
            query = query.Where(p => p.SellerId == sellerId.Value);

        if (minPrice.HasValue)
            query = query.Where(p =>
                (p.DiscountedPrice ?? p.BasePrice) >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p =>
                (p.DiscountedPrice ?? p.BasePrice) <= maxPrice.Value);

        if (minRating.HasValue)
            query = query.Where(p => p.AverageRating >= minRating.Value);

        if (inStock == true)
            query = query.Where(p => p.StockQuantity > 0);

        query = (sortBy.ToLower(), sortDesc) switch
        {
            ("price", true) => query.OrderByDescending(p => p.DiscountedPrice ?? p.BasePrice),
            ("price", false) => query.OrderBy(p => p.DiscountedPrice ?? p.BasePrice),
            ("rating", true) => query.OrderByDescending(p => p.AverageRating),
            ("rating", false) => query.OrderBy(p => p.AverageRating),
            ("name", _) => sortDesc
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),
            _ => sortDesc
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Product?> GetByIdAsync(Guid id) =>
        await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specifications)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Product?> GetBySlugAsync(string slug) =>
        await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specifications)
            .FirstOrDefaultAsync(p => p.Slug == slug);

    public async Task<IEnumerable<Product>> GetBySellerIdAsync(Guid sellerId) =>
        await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.SellerId == sellerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetFeaturedAsync(int count = 10) =>
        await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.AverageRating)
            .Take(count)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetLowStockAsync(int threshold = 10) =>
        await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .OrderBy(p => p.StockQuantity)
            .ToListAsync();

    public async Task AddAsync(Product product) =>
        await _context.Products.AddAsync(product);

    public Task UpdateAsync(Product product)
    {
        _context.Products.Update(product);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product != null) product.IsActive = false;
    }

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
