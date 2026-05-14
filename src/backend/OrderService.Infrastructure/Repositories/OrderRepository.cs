using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Infrastructure.Data;

namespace OrderService.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly OrderDbContext _context;

    public OrderRepository(OrderDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId, int page, int pageSize)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetBySellerIdAsync(Guid sellerId, int page, int pageSize)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .Where(o => o.Items.Any(i => i.SellerId == sellerId))
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetAllAsync(int page, int pageSize, OrderStatus? status)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
    }

    public async Task<int> CountByCustomerIdAsync(Guid customerId)
    {
        return await _context.Orders
            .CountAsync(o => o.CustomerId == customerId);
    }

    public async Task AddAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();
    }

    public async Task CreateAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
