using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces;

public interface ICouponRepository
{
    Task<Coupon?> GetByCodeAsync(string code);
    Task<IEnumerable<Coupon>> GetAllAsync();
    Task AddAsync(Coupon coupon);
    Task UpdateAsync(Coupon coupon);
    Task SaveChangesAsync();
}
