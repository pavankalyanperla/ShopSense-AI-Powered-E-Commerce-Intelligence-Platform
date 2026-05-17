using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly IAddressRepository _addressRepository;
    private readonly ICouponRepository _couponRepository;
    private readonly IMessagePublisher _messagePublisher;
    private const decimal FREE_DELIVERY_THRESHOLD = 499m;
    private const decimal DELIVERY_CHARGE = 40m;

    public OrderService(
        IOrderRepository orderRepository,
        ICartRepository cartRepository,
        IAddressRepository addressRepository,
        ICouponRepository couponRepository,
        IMessagePublisher messagePublisher)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _addressRepository = addressRepository;
        _couponRepository = couponRepository;
        _messagePublisher = messagePublisher;
    }

    public async Task<OrderDto> CheckoutAsync(Guid customerId, string customerEmail, string customerName, CheckoutRequest request)
    {
        // Get cart items
        var cartItems = await _cartRepository.GetByCustomerIdAsync(customerId);
        if (!cartItems.Any())
        {
            throw new Exception("Cart is empty");
        }

        // Validate address
        var address = await _addressRepository.GetByIdAsync(request.DeliveryAddressId);
        if (address == null || address.CustomerId != customerId)
        {
            throw new Exception("Invalid delivery address");
        }

        // Calculate totals
        decimal subTotal = cartItems.Sum(x => x.UnitPrice * x.Quantity);
        decimal deliveryCharge = subTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
        decimal discountAmount = 0;
        Guid? couponId = null;
        string? couponCode = null;

        // Apply coupon if provided
        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = await _couponRepository.GetByCodeAsync(request.CouponCode);
            if (coupon == null || !coupon.IsActive || coupon.ExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("Invalid or expired coupon");
            }

            if (subTotal < coupon.MinOrderValue)
            {
                throw new Exception($"Minimum order value of ₹{coupon.MinOrderValue} required for this coupon");
            }

            if (coupon.UsedCount >= coupon.UsageLimit)
            {
                throw new Exception("Coupon usage limit reached");
            }

            // Calculate discount
            if (coupon.DiscountType == DiscountType.Percentage)
            {
                discountAmount = subTotal * (coupon.DiscountValue / 100);
                if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                {
                    discountAmount = coupon.MaxDiscountAmount.Value;
                }
            }
            else // Flat discount
            {
                discountAmount = coupon.DiscountValue;
            }

            couponId = coupon.Id;
            couponCode = coupon.Code;

            // Update coupon usage
            coupon.UsedCount++;
            await _couponRepository.UpdateAsync(coupon);
            await _couponRepository.SaveChangesAsync();
        }

        decimal totalAmount = subTotal - discountAmount + deliveryCharge;

        // Generate order number: SS{yyyyMMdd}{random4digits}
        string orderNumber = $"SS{DateTime.UtcNow:yyyyMMdd}{new Random().Next(1000, 9999)}";

        // Create order
        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerId = customerId,
            CustomerEmail = customerEmail,
            CustomerName = customerName,
            Status = OrderStatus.Placed,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = request.PaymentMethod == PaymentMethod.COD ? PaymentStatus.Pending : PaymentStatus.Paid,
            SubTotal = subTotal,
            DiscountAmount = discountAmount,
            DeliveryCharge = deliveryCharge,
            TotalAmount = totalAmount,
            CouponId = couponId,
            CouponCode = couponCode,
            DeliveryAddressId = request.DeliveryAddressId,
            DeliveryAddress = address,
            Items = cartItems.Select(ci => new OrderItem
            {
                ProductId = ci.ProductId,
                ProductName = ci.ProductName,
                ProductImageUrl = ci.ProductImageUrl,
                SellerName = ci.SellerName,
                SellerId = ci.SellerId,
                Quantity = ci.Quantity,
                UnitPrice = ci.UnitPrice,
                FinalPrice = ci.UnitPrice * ci.Quantity,
                SelectedVariant = ci.SelectedVariant
            }).ToList(),
            StatusHistory = new List<OrderStatusHistory>
            {
                new OrderStatusHistory
                {
                    Status = OrderStatus.Placed,
                    Note = "Order placed successfully",
                    ChangedAt = DateTime.UtcNow,
                    ChangedBy = "System"
                }
            }
        };

        await _orderRepository.AddAsync(order);
        await _orderRepository.SaveChangesAsync();

        // Clear cart
        await _cartRepository.ClearAsync(customerId);
        await _cartRepository.SaveChangesAsync();

        // Publish order.placed event
        await _messagePublisher.PublishAsync("order.placed", "order.placed", new
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail,
            TotalAmount = order.TotalAmount,
            Items = order.Items.Select(i => new
            {
                i.ProductId,
                i.Quantity,
                i.SellerId
            }),
            CreatedAt = order.CreatedAt
        });

        // Publish fraud.check event
        await _messagePublisher.PublishAsync("fraud.check", "fraud.check", new
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            PaymentMethod = order.PaymentMethod.ToString(),
            DeliveryAddress = new
            {
                address.City,
                address.State,
                address.Pincode
            }
        });

        return MapToOrderDto(order);
    }

    public async Task<OrderDto> GetOrderByIdAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new Exception("Order not found");
        }
        return MapToOrderDto(order);
    }

    public async Task<OrderDto> GetOrderByNumberAsync(string orderNumber)
    {
        var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
        if (order == null)
        {
            throw new Exception("Order not found");
        }
        return MapToOrderDto(order);
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = await _orderRepository.GetByCustomerIdAsync(customerId, 1, 100);
        return orders.Select(MapToOrderDto).ToList();
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, string? remarks = null)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new Exception("Order not found");
        }

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (newStatus == OrderStatus.Delivered)
        {
            order.DeliveredAt = DateTime.UtcNow;
            order.PaymentStatus = PaymentStatus.Paid;
        }

        // Add status history
        order.StatusHistory.Add(new OrderStatusHistory
        {
            OrderId = orderId,
            Status = newStatus,
            Note = remarks,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = "System"
        });

        await _orderRepository.UpdateAsync(order);
        await _orderRepository.SaveChangesAsync();

        // Publish order.status event
        await _messagePublisher.PublishAsync("order.status", "order.status", new
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            Status = newStatus.ToString(),
            CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail,
            Remarks = remarks,
            UpdatedAt = order.UpdatedAt
        });

        return MapToOrderDto(order);
    }

    public async Task<OrderDto> RequestReturnAsync(Guid orderId, ReturnRequest request)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new Exception("Order not found");
        }

        if (order.Status != OrderStatus.Delivered)
        {
            throw new Exception("Only delivered orders can be returned");
        }

        var orderItem = order.Items.FirstOrDefault(x => x.Id == request.OrderItemId);
        if (orderItem == null)
        {
            throw new Exception("Order item not found");
        }

        orderItem.ReturnStatus = ReturnStatus.Requested;
        orderItem.ReturnReason = request.Reason;
        orderItem.ReturnRequestedAt = DateTime.UtcNow;

        // Update order status if all items are being returned
        if (order.Items.All(x => x.ReturnStatus == ReturnStatus.Requested))
        {
            order.Status = OrderStatus.ReturnRequested;
        }

        await _orderRepository.UpdateAsync(order);
        await _orderRepository.SaveChangesAsync();

        return MapToOrderDto(order);
    }

    public async Task<OrderDto> CancelOrderAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new Exception("Order not found");
        }

        if (order.Status != OrderStatus.Placed && order.Status != OrderStatus.Confirmed)
        {
            throw new Exception("Order cannot be cancelled at this stage");
        }

        var now = DateTime.UtcNow;
        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = now;

        await _orderRepository.UpdateStatusAsync(orderId, OrderStatus.Cancelled, now, new OrderStatusHistory
        {
            OrderId = orderId,
            Status = OrderStatus.Cancelled,
            Note = "Cancelled by customer",
            ChangedAt = now,
            ChangedBy = "System"
        });

        await _messagePublisher.PublishAsync("order.status", "order.status", new
        {
            OrderId = order.Id,
            OrderNumber = order.OrderNumber,
            Status = OrderStatus.Cancelled.ToString(),
            CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail,
            Remarks = "Cancelled by customer",
            UpdatedAt = order.UpdatedAt
        });

        return MapToOrderDto(order);
    }

    private OrderDto MapToOrderDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail,
            CustomerName = order.CustomerName,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            DeliveryCharge = order.DeliveryCharge,
            TotalAmount = order.TotalAmount,
            CouponCode = order.CouponCode,
            FraudScore = order.FraudScore,
            IsFraudFlagged = order.IsFraudFlagged,
            DeliveryAddress = new AddressDto
            {
                Id = order.DeliveryAddress.Id,
                CustomerId = order.DeliveryAddress.CustomerId,
                FullName = order.DeliveryAddress.FullName,
                PhoneNumber = order.DeliveryAddress.PhoneNumber,
                Line1 = order.DeliveryAddress.Line1,
                Line2 = order.DeliveryAddress.Line2,
                City = order.DeliveryAddress.City,
                State = order.DeliveryAddress.State,
                Pincode = order.DeliveryAddress.Pincode,
                Country = order.DeliveryAddress.Country,
                IsDefault = order.DeliveryAddress.IsDefault,
                CreatedAt = order.DeliveryAddress.CreatedAt
            },
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductImageUrl = i.ProductImageUrl,
                SellerName = i.SellerName,
                SellerId = i.SellerId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                FinalPrice = i.FinalPrice,
                SelectedVariant = i.SelectedVariant,
                ReturnStatus = i.ReturnStatus,
                ReturnReason = i.ReturnReason,
                ReturnRequestedAt = i.ReturnRequestedAt
            }).ToList(),
            StatusHistory = order.StatusHistory.Select(h => new OrderStatusHistoryDto
            {
                Id = h.Id,
                Status = h.Status,
                Remarks = h.Note,
                ChangedAt = h.ChangedAt
            }).ToList(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            DeliveredAt = order.DeliveredAt
        };
    }
}
