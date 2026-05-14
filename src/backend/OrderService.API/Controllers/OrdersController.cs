using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using System.Security.Claims;

namespace OrderService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customerEmail = User.FindFirstValue(ClaimTypes.Email)!;
        var customerName = User.FindFirstValue(ClaimTypes.Name) ?? "Customer";

        var order = await _orderService.CheckoutAsync(customerId, customerEmail, customerName, request);
        return Ok(order);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var orders = await _orderService.GetCustomerOrdersAsync(customerId);
        return Ok(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(Guid orderId)
    {
        var order = await _orderService.GetOrderByIdAsync(orderId);
        
        // Verify the order belongs to the user
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (order.CustomerId != customerId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        return Ok(order);
    }

    [HttpGet("number/{orderNumber}")]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber);
        
        // Verify the order belongs to the user
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (order.CustomerId != customerId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        return Ok(order);
    }

    [HttpPut("{orderId}/status")]
    [Authorize(Roles = "Admin,Seller")]
    public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _orderService.UpdateOrderStatusAsync(orderId, request.Status, request.Remarks);
        return Ok(order);
    }

    [HttpPost("{orderId}/return")]
    public async Task<IActionResult> RequestReturn(Guid orderId, [FromBody] ReturnRequest request)
    {
        var order = await _orderService.RequestReturnAsync(orderId, request);
        return Ok(order);
    }

    [HttpPost("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid orderId)
    {
        var order = await _orderService.CancelOrderAsync(orderId);
        return Ok(order);
    }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? Remarks { get; set; }
}
