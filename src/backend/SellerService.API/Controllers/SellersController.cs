using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SellerService.Application.DTOs;
using SellerService.Application.Interfaces;

namespace SellerService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SellersController : ControllerBase
{
    private readonly ISellerService _sellerService;
    private readonly ILogger<SellersController> _logger;

    public SellersController(ISellerService sellerService, ILogger<SellersController> logger)
    {
        _sellerService = sellerService;
        _logger = logger;
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<ActionResult<SellerDto>> Register([FromBody] RegisterSellerRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid user token");

        try
        {
            var seller = await _sellerService.RegisterAsync(request, userId);
            _logger.LogInformation("Seller registered: {SellerId}", seller.Id);
            return CreatedAtAction(nameof(GetById), new { id = seller.Id }, seller);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SellerDto>> GetById(Guid id)
    {
        var seller = await _sellerService.GetByIdAsync(id);
        if (seller == null)
            return NotFound();

        return Ok(seller);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<SellerDto>> GetByUserId(Guid userId)
    {
        var seller = await _sellerService.GetByUserIdAsync(userId);
        if (seller == null)
            return NotFound();

        return Ok(seller);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<SellerDto>>> GetAll()
    {
        var sellers = await _sellerService.GetAllAsync();
        return Ok(sellers);
    }

    [HttpPost("{id}/kyc")]
    [Authorize]
    public async Task<ActionResult<SellerDto>> SubmitKyc(Guid id, [FromBody] SubmitKycRequest request)
    {
        var seller = await _sellerService.SubmitKycAsync(id, request);
        if (seller == null)
            return NotFound();

        _logger.LogInformation("KYC submitted for seller: {SellerId}, Status: {Status}", 
            seller.Id, seller.KycStatus);
        return Ok(seller);
    }

    [HttpGet("{id}/kyc/status")]
    [Authorize]
    public async Task<ActionResult<SellerDto>> GetKycStatus(Guid id)
    {
        var seller = await _sellerService.GetKycStatusAsync(id);
        if (seller == null)
            return NotFound();

        return Ok(new { 
            sellerId = seller.Id, 
            kycStatus = seller.KycStatus,
            status = seller.Status
        });
    }

    [HttpGet("{id}/earnings")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<EarningsDto>>> GetEarnings(Guid id)
    {
        var earnings = await _sellerService.GetEarningsAsync(id);
        return Ok(earnings);
    }

    [HttpPost("listing-coach")]
    [Authorize]
    public async Task<ActionResult<ListingCoachResponse>> GetListingCoach([FromBody] ListingCoachRequest request)
    {
        var response = await _sellerService.GetListingCoachAsync(request);
        return Ok(response);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var success = await _sellerService.UpdateStatusAsync(id, status);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
