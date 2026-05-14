using OrderService.Application.DTOs;

namespace OrderService.Application.Interfaces;

public interface IAddressService
{
    Task<List<AddressDto>> GetCustomerAddressesAsync(Guid customerId);
    Task<AddressDto> GetAddressByIdAsync(Guid addressId);
    Task<AddressDto> CreateAddressAsync(Guid customerId, CreateAddressRequest request);
    Task<AddressDto> UpdateAddressAsync(Guid addressId, CreateAddressRequest request);
    Task<bool> DeleteAddressAsync(Guid addressId);
    Task<AddressDto> SetDefaultAddressAsync(Guid customerId, Guid addressId);
}
