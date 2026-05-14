using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using System.Security.Claims;

namespace OrderService.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var addresses = await _addressService.GetCustomerAddressesAsync(customerId);
        return Ok(addresses);
    }

    [HttpGet("{addressId}")]
    public async Task<IActionResult> GetAddressById(Guid addressId)
    {
        var address = await _addressService.GetAddressByIdAsync(addressId);
        
        // Verify the address belongs to the user
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (address.CustomerId != customerId)
        {
            return Forbid();
        }

        return Ok(address);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var address = await _addressService.CreateAddressAsync(customerId, request);
        return CreatedAtAction(nameof(GetAddressById), new { addressId = address.Id }, address);
    }

    [HttpPut("{addressId}")]
    public async Task<IActionResult> UpdateAddress(Guid addressId, [FromBody] CreateAddressRequest request)
    {
        var address = await _addressService.UpdateAddressAsync(addressId, request);
        return Ok(address);
    }

    [HttpDelete("{addressId}")]
    public async Task<IActionResult> DeleteAddress(Guid addressId)
    {
        var result = await _addressService.DeleteAddressAsync(addressId);
        
        if (!result)
        {
            return NotFound(new { message = "Address not found" });
        }

        return Ok(new { message = "Address deleted" });
    }

    [HttpPut("{addressId}/set-default")]
    public async Task<IActionResult> SetDefaultAddress(Guid addressId)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var address = await _addressService.SetDefaultAddressAsync(customerId, addressId);
        return Ok(address);
    }
}
