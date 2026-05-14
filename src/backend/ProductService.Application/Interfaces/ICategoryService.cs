using ProductService.Application.DTOs;

namespace ProductService.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync();
    Task<IEnumerable<CategoryDto>> GetTreeAsync();
    Task<CategoryDto?> GetByIdAsync(Guid id);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request);
}
