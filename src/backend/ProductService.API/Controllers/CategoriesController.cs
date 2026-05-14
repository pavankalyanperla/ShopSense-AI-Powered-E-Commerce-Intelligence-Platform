using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ProductService.Application.DTOs;
using ProductService.Application.Interfaces;

namespace ProductService.API.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories) => _categories = categories;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _categories.GetAllAsync());

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree() =>
        Ok(await _categories.GetTreeAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var cat = await _categories.GetByIdAsync(id);
        return cat == null ? NotFound() : Ok(cat);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var cat = await _categories.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, cat);
    }
}
