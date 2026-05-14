using OrderService.Application.DTOs;

namespace OrderService.Application.Interfaces;

public interface ICouponService
{
    Task<List<CouponDto>> GetActiveCouponsAsync();
    Task<CouponDto> GetCouponByCodeAsync(string code);
    Task<CouponValidationResponse> ValidateCouponAsync(CouponValidationRequest request);
    Task<CouponDto> CreateCouponAsync(CreateCouponRequest request);
}
