using Microsoft.EntityFrameworkCore;
using ProductService.Domain.Entities;
using ProductService.Domain.Interfaces;
using ProductService.Infrastructure.Data;

namespace ProductService.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ProductDbContext _context;

    public CategoryRepository(ProductDbContext context) => _context = context;

    public async Task<IEnumerable<Category>> GetAllAsync() =>
        await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

    public async Task<IEnumerable<Category>> GetRootCategoriesAsync() =>
        await _context.Categories
            .Include(c => c.SubCategories)
            .Where(c => c.ParentCategoryId == null && c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

    public async Task<Category?> GetByIdAsync(Guid id) =>
        await _context.Categories
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Category?> GetBySlugAsync(string slug) =>
        await _context.Categories
            .FirstOrDefaultAsync(c => c.Slug == slug);

    public async Task AddAsync(Category category) =>
        await _context.Categories.AddAsync(category);

    public Task UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
