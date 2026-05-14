using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services;

public class CouponService : ICouponService
{
    private readonly ICouponRepository _couponRepository;

    public CouponService(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<List<CouponDto>> GetActiveCouponsAsync()
    {
        var coupons = await _couponRepository.GetAllAsync();
        var activeCoupons = coupons.Where(c => c.IsActive && c.ExpiresAt > DateTime.UtcNow);
        return activeCoupons.Select(MapToCouponDto).ToList();
    }

    public async Task<CouponDto> GetCouponByCodeAsync(string code)
    {
        var coupon = await _couponRepository.GetByCodeAsync(code);
        if (coupon == null)
        {
            throw new Exception("Coupon not found");
        }
        return MapToCouponDto(coupon);
    }

    public async Task<CouponValidationResponse> ValidateCouponAsync(CouponValidationRequest request)
    {
        var coupon = await _couponRepository.GetByCodeAsync(request.CouponCode);

        if (coupon == null)
        {
            return new CouponValidationResponse
            {
                IsValid = false,
                Message = "Invalid coupon code"
            };
        }

        if (!coupon.IsActive)
        {
            return new CouponValidationResponse
            {
                IsValid = false,
                Message = "Coupon is not active"
            };
        }

        if (coupon.ExpiresAt < DateTime.UtcNow)
        {
            return new CouponValidationResponse
            {
                IsValid = false,
                Message = "Coupon has expired"
            };
        }

        if (coupon.UsedCount >= coupon.UsageLimit)
        {
            return new CouponValidationResponse
            {
                IsValid = false,
                Message = "Coupon usage limit reached"
            };
        }

        if (request.CartTotal < coupon.MinOrderValue)
        {
            return new CouponValidationResponse
            {
                IsValid = false,
                Message = $"Minimum order value of ₹{coupon.MinOrderValue} required"
            };
        }

        // Calculate discount
        decimal discountAmount = 0;
        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discountAmount = request.CartTotal * (coupon.DiscountValue / 100);
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
            {
                discountAmount = coupon.MaxDiscountAmount.Value;
            }
        }
        else // Flat discount
        {
            discountAmount = coupon.DiscountValue;
        }

        return new CouponValidationResponse
        {
            IsValid = true,
            Message = "Coupon applied successfully",
            DiscountAmount = discountAmount,
            CouponId = coupon.Id
        };
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponRequest request)
    {
        // Check if coupon code already exists
        var existingCoupon = await _couponRepository.GetByCodeAsync(request.Code);
        if (existingCoupon != null)
        {
            throw new Exception("Coupon code already exists");
        }

        var coupon = new Coupon
        {
            Code = request.Code.ToUpper(),
            Description = request.Description,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinOrderValue = request.MinOrderValue,
            MaxDiscountAmount = request.MaxDiscountAmount,
            ExpiresAt = request.ExpiresAt,
            UsageLimit = request.UsageLimit
        };

        await _couponRepository.AddAsync(coupon);
        await _couponRepository.SaveChangesAsync();
        return MapToCouponDto(coupon);
    }

    private CouponDto MapToCouponDto(Coupon coupon)
    {
        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinOrderValue = coupon.MinOrderValue,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            ExpiresAt = coupon.ExpiresAt,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt
        };
    }
}
