using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;

namespace OrderService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveCoupons()
    {
        var coupons = await _couponService.GetActiveCouponsAsync();
        return Ok(coupons);
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> GetCouponByCode(string code)
    {
        var coupon = await _couponService.GetCouponByCodeAsync(code);
        return Ok(coupon);
    }

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> ValidateCoupon([FromBody] CouponValidationRequest request)
    {
        var result = await _couponService.ValidateCouponAsync(request);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        var coupon = await _couponService.CreateCouponAsync(request);
        return CreatedAtAction(nameof(GetCouponByCode), new { code = coupon.Code }, coupon);
    }
}
