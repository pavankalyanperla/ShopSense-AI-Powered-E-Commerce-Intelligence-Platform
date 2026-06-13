using FluentAssertions;
using Moq;
using NUnit.Framework;
using OrderService.Application.DTOs;
using OrderService.Application.Services;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;

namespace OrderService.Tests.Application;

[TestFixture]
public class CouponTests
{
    private Mock<ICouponRepository> _couponRepo;
    private CouponService _couponService;

    [SetUp]
    public void SetUp()
    {
        _couponRepo = new Mock<ICouponRepository>();
        _couponService = new CouponService(_couponRepo.Object);
    }

    private static Coupon ValidCoupon(DiscountType type = DiscountType.Flat, decimal value = 100m) => new()
    {
        Id = Guid.NewGuid(),
        Code = "TEST100",
        IsActive = true,
        ExpiresAt = DateTime.UtcNow.AddDays(30),
        UsageLimit = 100,
        UsedCount = 0,
        MinOrderValue = 500m,
        DiscountType = type,
        DiscountValue = value,
        MaxDiscountAmount = null
    };

    [Test]
    public async Task ValidateCoupon_NullCoupon_ReturnsInvalid()
    {
        _couponRepo.Setup(r => r.GetByCodeAsync("INVALID"))
                   .ReturnsAsync((Coupon?)null);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "INVALID",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Invalid coupon code");
    }

    [Test]
    public async Task ValidateCoupon_InactiveCoupon_ReturnsInvalid()
    {
        var coupon = ValidCoupon();
        coupon.IsActive = false;
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Coupon is not active");
    }

    [Test]
    public async Task ValidateCoupon_ExpiredCoupon_ReturnsInvalid()
    {
        var coupon = ValidCoupon();
        coupon.ExpiresAt = DateTime.UtcNow.AddDays(-1);
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Coupon has expired");
    }

    [Test]
    public async Task ValidateCoupon_UsageLimitReached_ReturnsInvalid()
    {
        var coupon = ValidCoupon();
        coupon.UsageLimit = 10;
        coupon.UsedCount = 10;
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Coupon usage limit reached");
    }

    [Test]
    public async Task ValidateCoupon_BelowMinOrder_ReturnsInvalid()
    {
        var coupon = ValidCoupon();
        coupon.MinOrderValue = 500m;
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 300m
        });

        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("500");
    }

    [Test]
    public async Task ValidateCoupon_FlatDiscount_ReturnsCorrectAmount()
    {
        var coupon = ValidCoupon(DiscountType.Flat, 100m);
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeTrue();
        result.DiscountAmount.Should().Be(100m);
    }

    [Test]
    public async Task ValidateCoupon_PercentageDiscount_ReturnsCorrectAmount()
    {
        var coupon = ValidCoupon(DiscountType.Percentage, 10m);
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 2000m
        });

        result.IsValid.Should().BeTrue();
        result.DiscountAmount.Should().Be(200m);
    }

    [Test]
    public async Task ValidateCoupon_PercentageWithCap_CapsAtMaxDiscount()
    {
        var coupon = ValidCoupon(DiscountType.Percentage, 20m);
        coupon.MaxDiscountAmount = 150m;
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 2000m
        });

        result.IsValid.Should().BeTrue();
        result.DiscountAmount.Should().Be(150m);
    }

    [Test]
    public async Task ValidateCoupon_ValidCoupon_ReturnsCouponId()
    {
        var coupon = ValidCoupon();
        _couponRepo.Setup(r => r.GetByCodeAsync("TEST100")).ReturnsAsync(coupon);

        var result = await _couponService.ValidateCouponAsync(new CouponValidationRequest
        {
            CouponCode = "TEST100",
            CartTotal = 1000m
        });

        result.IsValid.Should().BeTrue();
        result.CouponId.Should().Be(coupon.Id);
    }
}
