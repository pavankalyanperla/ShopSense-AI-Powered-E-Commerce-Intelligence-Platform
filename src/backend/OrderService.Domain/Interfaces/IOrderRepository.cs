using OrderService.Domain.Entities;

namespace OrderService.Domain.Interfaces;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId, int page, int pageSize);
    Task<IEnumerable<Order>> GetBySellerIdAsync(Guid sellerId, int page, int pageSize);
    Task<IEnumerable<Order>> GetAllAsync(int page, int pageSize, OrderStatus? status);
    Task<Order?> GetByIdAsync(Guid id);
    Task<Order?> GetByOrderNumberAsync(string orderNumber);
    Task<int> CountByCustomerIdAsync(Guid customerId);
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
    Task UpdateStatusAsync(Guid orderId, OrderStatus newStatus, DateTime updatedAt, OrderStatusHistory historyEntry);
    Task SaveChangesAsync();
}
