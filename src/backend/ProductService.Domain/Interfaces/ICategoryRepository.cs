using ProductService.Domain.Entities;

namespace ProductService.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<IEnumerable<Category>> GetRootCategoriesAsync();
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category?> GetBySlugAsync(string slug);
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task SaveChangesAsync();
}
