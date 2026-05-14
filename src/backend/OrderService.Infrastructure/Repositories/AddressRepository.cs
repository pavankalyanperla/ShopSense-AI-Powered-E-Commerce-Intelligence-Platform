using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Data;

namespace OrderService.Infrastructure.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly OrderDbContext _context;

    public AddressRepository(OrderDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Address>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.Addresses
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Address?> GetByIdAsync(Guid id)
    {
        return await _context.Addresses.FindAsync(id);
    }

    public async Task<Address?> GetDefaultAsync(Guid customerId)
    {
        return await _context.Addresses
            .FirstOrDefaultAsync(a => a.CustomerId == customerId && a.IsDefault);
    }

    public async Task AddAsync(Address address)
    {
        await _context.Addresses.AddAsync(address);
        await _context.SaveChangesAsync();
    }

    public async Task CreateAsync(Address address)
    {
        await _context.Addresses.AddAsync(address);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Address address)
    {
        _context.Addresses.Update(address);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address != null)
        {
            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UnsetDefaultAddressAsync(Guid customerId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.CustomerId == customerId && a.IsDefault)
            .ToListAsync();

        foreach (var address in addresses)
        {
            address.IsDefault = false;
        }

        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
