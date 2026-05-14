using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ProductService.Application.DTOs;
using ProductService.Application.Interfaces;

namespace ProductService.API.Controllers;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParams query)
    {
        var result = await _products.GetProductsAsync(query);
        return Ok(result);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured([FromQuery] int count = 10)
    {
        var result = await _products.GetFeaturedAsync(count);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _products.GetByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var product = await _products.GetBySlugAsync(slug);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpGet("seller/{sellerId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetBySeller(Guid sellerId)
    {
        var products = await _products.GetBySellerAsync(sellerId);
        return Ok(products);
    }

    [HttpPost]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var sellerId = Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
        var sellerName = User.FindFirstValue(ClaimTypes.Name) ?? "Seller";
        var product = await _products.CreateAsync(request, sellerId, sellerName);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var sellerId = Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
        var product = await _products.UpdateAsync(id, request, sellerId);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var sellerId = Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
        var success = await _products.DeleteAsync(id, sellerId);
        return success ? NoContent() : NotFound();
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Seller")]
    public async Task<IActionResult> GetLowStock()
    {
        var products = await _products.GetLowStockAsync();
        return Ok(products);
    }

    // Internal endpoints called by other microservices
    [HttpPut("{id:guid}/sentiment")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateSentiment(Guid id, [FromBody] UpdateSentimentRequest request)
    {
        await _products.UpdateSentimentAsync(id, request.Label, request.Score);
        return Ok();
    }

    [HttpPut("{id:guid}/rating")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateRating(Guid id, [FromBody] UpdateRatingRequest request)
    {
        await _products.UpdateRatingAsync(id, request.AverageRating, request.ReviewCount);
        return Ok();
    }
}

public record UpdateSentimentRequest(string Label, double Score);
public record UpdateRatingRequest(double AverageRating, int ReviewCount);
