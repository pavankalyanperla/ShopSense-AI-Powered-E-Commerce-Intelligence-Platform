using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ReviewService.Application.DTOs;
using ReviewService.Application.Interfaces;

namespace ReviewService.API.Controllers;

[ApiController]
[Route("api/v1/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    private Guid UserId => Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);
    private string UserName => User.FindFirstValue("fullName") ?? "Customer";

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var reviews = await _reviews.GetByProductAsync(productId, page, pageSize);
        return Ok(reviews);
    }

    [HttpGet("product/{productId:guid}/summary")]
    public async Task<IActionResult> GetSummary(Guid productId) =>
        Ok(await _reviews.GetRatingSummaryAsync(productId));

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMy() =>
        Ok(await _reviews.GetByCustomerAsync(UserId));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        try
        {
            var review = await _reviews.CreateAsync(request, UserId, UserName);
            return CreatedAtAction(nameof(GetByProduct), new { productId = review.ProductId }, review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reply")]
    [Authorize(Roles = "Seller,Admin")]
    public async Task<IActionResult> AddReply(Guid id, [FromBody] AddReplyRequest request)
    {
        var review = await _reviews.AddReplyAsync(id, UserId, UserName, request);
        return review == null ? NotFound() : Ok(review);
    }

    [HttpPost("{id:guid}/flag")]
    [Authorize]
    public async Task<IActionResult> Flag(Guid id, [FromBody] FlagReviewRequest request)
    {
        var success = await _reviews.FlagReviewAsync(id, UserId, request);
        return success ? Ok(new { message = "Review flagged" }) : NotFound();
    }

    [HttpGet("flagged")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFlagged() =>
        Ok(await _reviews.GetFlaggedAsync());

    [HttpPut("{id:guid}/moderate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Moderate(Guid id, [FromBody] ModerateRequest request)
    {
        var success = await _reviews.ModerateAsync(id, request.Approve);
        return success ? Ok(new { message = "Review moderated" }) : NotFound();
    }
}

public record ModerateRequest(bool Approve);
