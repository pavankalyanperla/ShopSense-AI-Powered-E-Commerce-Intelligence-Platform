using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cart = await _cartService.GetCartAsync(customerId);
        return Ok(cart);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cart = await _cartService.AddToCartAsync(customerId, request);
        return Ok(cart);
    }

    [HttpPut("{cartItemId}")]
    public async Task<IActionResult> UpdateCartItem(Guid cartItemId, [FromBody] int quantity)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cart = await _cartService.UpdateCartItemAsync(customerId, cartItemId, quantity);
        return Ok(cart);
    }

    [HttpDelete("{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(Guid cartItemId)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _cartService.RemoveFromCartAsync(customerId, cartItemId);
        
        if (!result)
        {
            return NotFound(new { message = "Cart item not found" });
        }

        return Ok(new { message = "Item removed from cart" });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _cartService.ClearCartAsync(customerId);
        return Ok(new { message = "Cart cleared" });
    }
}
