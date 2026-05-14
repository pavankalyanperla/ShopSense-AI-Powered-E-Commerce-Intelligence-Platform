using OrderService.Application.DTOs;
using OrderService.Domain.Entities;

namespace OrderService.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(Guid customerId, string customerEmail, string customerName, CheckoutRequest request);
    Task<OrderDto> GetOrderByIdAsync(Guid orderId);
    Task<OrderDto> GetOrderByNumberAsync(string orderNumber);
    Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId);
    Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, string? remarks = null);
    Task<OrderDto> RequestReturnAsync(Guid orderId, ReturnRequest request);
    Task<OrderDto> CancelOrderAsync(Guid orderId);
}
