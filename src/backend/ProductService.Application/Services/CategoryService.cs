using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Application.DTOs;
using ProductService.Application.Interfaces;

namespace ProductService.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;

    public CategoryService(ICategoryRepository categories) => _categories = categories;

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var cats = await _categories.GetAllAsync();
        return cats.Select(MapToDto);
    }

    public async Task<IEnumerable<CategoryDto>> GetTreeAsync()
    {
        var roots = await _categories.GetRootCategoriesAsync();
        return roots.Select(MapToDtoWithChildren);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id)
    {
        var cat = await _categories.GetByIdAsync(id);
        return cat == null ? null : MapToDto(cat);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            Slug = request.Name.ToLowerInvariant().Replace(" ", "-"),
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            ParentCategoryId = request.ParentCategoryId,
            DisplayOrder = request.DisplayOrder
        };

        await _categories.AddAsync(category);
        await _categories.SaveChangesAsync();
        return MapToDto(category);
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        Description = c.Description,
        ImageUrl = c.ImageUrl,
        ParentCategoryId = c.ParentCategoryId,
        DisplayOrder = c.DisplayOrder
    };

    private static CategoryDto MapToDtoWithChildren(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        Description = c.Description,
        ImageUrl = c.ImageUrl,
        ParentCategoryId = c.ParentCategoryId,
        DisplayOrder = c.DisplayOrder,
        SubCategories = c.SubCategories.Select(MapToDtoWithChildren).ToList()
    };
}
