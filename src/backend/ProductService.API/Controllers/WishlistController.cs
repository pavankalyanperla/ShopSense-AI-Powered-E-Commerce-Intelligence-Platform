using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ProductService.Application.Interfaces;

namespace ProductService.API.Controllers;

[ApiController]
[Route("api/v1/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlist;

    public WishlistController(IWishlistService wishlist) => _wishlist = wishlist;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);

    [HttpGet]
    public async Task<IActionResult> Get() =>
        Ok(await _wishlist.GetWishlistAsync(GetUserId()));

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId)
    {
        var added = await _wishlist.AddToWishlistAsync(GetUserId(), productId);
        return added
            ? Ok(new { message = "Added to wishlist" })
            : BadRequest(new { message = "Already in wishlist" });
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        await _wishlist.RemoveFromWishlistAsync(GetUserId(), productId);
        return Ok(new { message = "Removed from wishlist" });
    }

    [HttpGet("{productId:guid}/check")]
    public async Task<IActionResult> Check(Guid productId) =>
        Ok(new { isWishlisted = await _wishlist.IsWishlistedAsync(GetUserId(), productId) });
}
