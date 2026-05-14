using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Application.DTOs;
using ProductService.Application.Interfaces;

namespace ProductService.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;

    public ProductService(IProductRepository products, ICategoryRepository categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query)
    {
        var (items, total) = await _products.GetPagedAsync(
            query.Search, query.CategoryId, query.SellerId,
            query.MinPrice, query.MaxPrice, query.MinRating, query.InStock,
            query.SortBy, query.SortDesc, query.Page, query.PageSize);

        return new PagedResult<ProductDto>
        {
            Items = items.Select(MapToDto),
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var product = await _products.GetByIdAsync(id);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto?> GetBySlugAsync(string slug)
    {
        var product = await _products.GetBySlugAsync(slug);
        return product == null ? null : MapToDto(product);
    }

    public async Task<IEnumerable<ProductDto>> GetFeaturedAsync(int count = 10)
    {
        var products = await _products.GetFeaturedAsync(count);
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetBySellerAsync(Guid sellerId)
    {
        var products = await _products.GetBySellerIdAsync(sellerId);
        return products.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductDto>> GetLowStockAsync()
    {
        var products = await _products.GetLowStockAsync();
        return products.Select(MapToDto);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, Guid sellerId, string sellerName)
    {
        var slug = GenerateSlug(request.Name);
        var product = new Product
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            Brand = request.Brand,
            CategoryId = request.CategoryId,
            SellerId = sellerId,
            SellerName = sellerName,
            BasePrice = request.BasePrice,
            DiscountedPrice = request.DiscountedPrice,
            DiscountPercent = request.DiscountedPrice.HasValue
                ? Math.Round((1 - request.DiscountedPrice.Value / request.BasePrice) * 100, 1)
                : 0,
            StockQuantity = request.StockQuantity,
            LowStockThreshold = request.LowStockThreshold,
            SKU = string.IsNullOrEmpty(request.SKU) ? GenerateSKU() : request.SKU,
            IsFeatured = request.IsFeatured,
            Images = request.ImageUrls.Select((url, i) => new ProductImage
            {
                ImageUrl = url,
                IsPrimary = i == 0,
                DisplayOrder = i
            }).ToList(),
            Variants = request.Variants.Select(v => new ProductVariant
            {
                VariantType = v.VariantType,
                VariantValue = v.VariantValue,
                AdditionalPrice = v.AdditionalPrice,
                Stock = v.Stock
            }).ToList(),
            Specifications = request.Specifications.Select(s => new ProductSpecification
            {
                Key = s.Key,
                Value = s.Value
            }).ToList()
        };

        await _products.AddAsync(product);
        await _products.SaveChangesAsync();
        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, UpdateProductRequest request, Guid sellerId)
    {
        var product = await _products.GetByIdAsync(id);
        if (product == null || product.SellerId != sellerId) return null;

        product.Name = request.Name;
        product.Description = request.Description;
        product.Brand = request.Brand;
        product.CategoryId = request.CategoryId;
        product.BasePrice = request.BasePrice;
        product.DiscountedPrice = request.DiscountedPrice;
        product.DiscountPercent = request.DiscountedPrice.HasValue
            ? Math.Round((1 - request.DiscountedPrice.Value / request.BasePrice) * 100, 1)
            : 0;
        product.StockQuantity = request.StockQuantity;
        product.LowStockThreshold = request.LowStockThreshold;
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product);
        await _products.SaveChangesAsync();
        return MapToDto(product);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid sellerId)
    {
        var product = await _products.GetByIdAsync(id);
        if (product == null || product.SellerId != sellerId) return false;

        await _products.DeleteAsync(id);
        await _products.SaveChangesAsync();
        return true;
    }

    public async Task UpdateSentimentAsync(Guid productId, string label, double score)
    {
        var product = await _products.GetByIdAsync(productId);
        if (product == null) return;

        product.SentimentLabel = label;
        product.SentimentScore = score;
        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product);
        await _products.SaveChangesAsync();
    }

    public async Task UpdateRatingAsync(Guid productId, double avgRating, int reviewCount)
    {
        var product = await _products.GetByIdAsync(productId);
        if (product == null) return;

        product.AverageRating = avgRating;
        product.ReviewCount = reviewCount;
        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product);
        await _products.SaveChangesAsync();
    }

    public async Task UpdateRecommendedPriceAsync(Guid productId, string price)
    {
        var product = await _products.GetByIdAsync(productId);
        if (product == null) return;

        product.RecommendedPrice = price;
        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product);
        await _products.SaveChangesAsync();
    }

    private static string GenerateSlug(string name) =>
        name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("/", "-")
            .Replace("&", "and")
            .Replace(",", "")
            .Replace(".", "")
            + "-" + Guid.NewGuid().ToString()[..6];

    private static string GenerateSKU() =>
        "SS-" + Guid.NewGuid().ToString()[..8].ToUpper();

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Description = p.Description,
        Brand = p.Brand,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        SellerId = p.SellerId,
        SellerName = p.SellerName,
        BasePrice = p.BasePrice,
        DiscountedPrice = p.DiscountedPrice,
        DiscountPercent = p.DiscountPercent,
        StockQuantity = p.StockQuantity,
        IsActive = p.IsActive,
        IsFeatured = p.IsFeatured,
        AverageRating = p.AverageRating,
        ReviewCount = p.ReviewCount,
        SentimentLabel = p.SentimentLabel,
        SentimentScore = p.SentimentScore,
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
            ?? p.Images.FirstOrDefault()?.ImageUrl ?? string.Empty,
        Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
        {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            IsPrimary = i.IsPrimary,
            DisplayOrder = i.DisplayOrder
        }).ToList(),
        Variants = p.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            VariantType = v.VariantType,
            VariantValue = v.VariantValue,
            AdditionalPrice = v.AdditionalPrice,
            Stock = v.Stock
        }).ToList(),
        Specifications = p.Specifications.Select(s => new ProductSpecDto
        {
            Key = s.Key,
            Value = s.Value
        }).ToList(),
        CreatedAt = p.CreatedAt
    };
}
