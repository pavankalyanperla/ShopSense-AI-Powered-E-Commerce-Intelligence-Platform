using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;
using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using System.Text.Json;

namespace OrderService.Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cart;
    private readonly IHttpClientFactory _httpClientFactory;

    public CartService(ICartRepository cart, IHttpClientFactory httpClientFactory)
    {
        _cart = cart;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<CartDto> GetCartAsync(Guid customerId)
    {
        var items = await _cart.GetByCustomerIdAsync(customerId);
        return BuildCartDto(items.ToList());
    }

    public async Task<CartDto> AddToCartAsync(Guid customerId, AddToCartRequest request)
    {
        // Fetch product details from ProductService
        var httpClient = _httpClientFactory.CreateClient("ProductService");
        var response = await httpClient.GetAsync($"/api/v1/products/{request.ProductId}");
        
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Product not found or unavailable");
        }

        var productJson = await response.Content.ReadAsStringAsync();
        var productData = JsonSerializer.Deserialize<JsonElement>(productJson);

        // Extract product details
        var productName = productData.GetProperty("name").GetString() ?? "";
        var productImageUrl = productData.TryGetProperty("primaryImageUrl", out var imgProp) ? imgProp.GetString() : productData.TryGetProperty("imageUrl", out var imgProp2) ? imgProp2.GetString() : null;
        var unitPrice = productData.TryGetProperty("discountedPrice", out var dp) ? dp.GetDecimal() : productData.GetProperty("basePrice").GetDecimal();
        var stock = productData.GetProperty("stockQuantity").GetInt32();
        var sellerName = productData.GetProperty("sellerName").GetString() ?? "";
        var sellerId = productData.GetProperty("sellerId").GetGuid();

        // Validate stock
        if (stock < request.Quantity)
        {
            throw new Exception($"Insufficient stock. Only {stock} items available");
        }

        var existing = await _cart.GetItemAsync(customerId, request.ProductId);
        
        if (existing != null)
        {
            existing.Quantity = Math.Min(existing.Quantity + request.Quantity, stock);
            existing.UpdatedAt = DateTime.UtcNow;
            await _cart.UpdateAsync(existing);
        }
        else
        {
            await _cart.AddAsync(new CartItem
            {
                CustomerId = customerId,
                ProductId = request.ProductId,
                ProductName = productName,
                ProductImageUrl = productImageUrl,
                SellerName = sellerName,
                SellerId = sellerId,
                UnitPrice = unitPrice,
                Quantity = request.Quantity,
                MaxStock = stock,
                SelectedVariant = request.SelectedVariant
            });
        }

        await _cart.SaveChangesAsync();
        var items = await _cart.GetByCustomerIdAsync(customerId);
        return BuildCartDto(items.ToList());
    }

    public async Task<CartDto> UpdateCartItemAsync(Guid customerId, Guid cartItemId, int quantity)
    {
        var items = await _cart.GetByCustomerIdAsync(customerId);
        var item = items.FirstOrDefault(i => i.Id == cartItemId);
        
        if (item != null)
        {
            if (quantity <= 0)
            {
                await _cart.RemoveAsync(customerId, item.ProductId);
            }
            else
            {
                item.Quantity = Math.Min(quantity, item.MaxStock);
                item.UpdatedAt = DateTime.UtcNow;
                await _cart.UpdateAsync(item);
            }
            
            await _cart.SaveChangesAsync();
        }

        var updatedItems = await _cart.GetByCustomerIdAsync(customerId);
        return BuildCartDto(updatedItems.ToList());
    }

    public async Task<bool> RemoveFromCartAsync(Guid customerId, Guid cartItemId)
    {
        var items = await _cart.GetByCustomerIdAsync(customerId);
        var item = items.FirstOrDefault(i => i.Id == cartItemId);
        
        if (item == null)
        {
            return false;
        }

        await _cart.RemoveAsync(customerId, item.ProductId);
        await _cart.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ClearCartAsync(Guid customerId)
    {
        await _cart.ClearAsync(customerId);
        await _cart.SaveChangesAsync();
        return true;
    }

    private static CartDto BuildCartDto(List<CartItem> items)
    {
        var subTotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var delivery = subTotal >= 499 ? 0 : 40; // Free delivery above ₹499, else ₹40

        return new CartDto
        {
            Items = items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductImageUrl = i.ProductImageUrl,
                SellerName = i.SellerName,
                SellerId = i.SellerId,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                MaxStock = i.MaxStock,
                ItemTotal = i.UnitPrice * i.Quantity,
                SelectedVariant = i.SelectedVariant
            }).ToList(),
            SubTotal = subTotal,
            DeliveryCharge = delivery,
            TotalAmount = subTotal + delivery,
            ItemCount = items.Sum(i => i.Quantity)
        };
    }
}
