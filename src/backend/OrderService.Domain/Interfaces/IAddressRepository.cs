using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces;

public interface IAddressRepository
{
    Task<IEnumerable<Address>> GetByCustomerIdAsync(Guid customerId);
    Task<Address?> GetByIdAsync(Guid id);
    Task<Address?> GetDefaultAsync(Guid customerId);
    Task AddAsync(Address address);
    Task UpdateAsync(Address address);
    Task DeleteAsync(Guid id);
    Task SaveChangesAsync();
}
