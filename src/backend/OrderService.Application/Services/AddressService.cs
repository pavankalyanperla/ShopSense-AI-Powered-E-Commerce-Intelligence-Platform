using OrderService.Application.DTOs;
using OrderService.Application.Interfaces;
using OrderService.Domain.Entities;
using OrderService.Domain.Interfaces;

namespace OrderService.Application.Services;

public class AddressService : IAddressService
{
    private readonly IAddressRepository _addressRepository;

    public AddressService(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<List<AddressDto>> GetCustomerAddressesAsync(Guid customerId)
    {
        var addresses = await _addressRepository.GetByCustomerIdAsync(customerId);
        return addresses.Select(MapToAddressDto).ToList();
    }

    public async Task<AddressDto> GetAddressByIdAsync(Guid addressId)
    {
        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null)
        {
            throw new Exception("Address not found");
        }
        return MapToAddressDto(address);
    }

    public async Task<AddressDto> CreateAddressAsync(Guid customerId, CreateAddressRequest request)
    {
        // If this is set as default, unset other defaults
        if (request.IsDefault)
        {
            var addresses = await _addressRepository.GetByCustomerIdAsync(customerId);
            foreach (var addr in addresses.Where(a => a.IsDefault))
            {
                addr.IsDefault = false;
                await _addressRepository.UpdateAsync(addr);
            }
            await _addressRepository.SaveChangesAsync();
        }

        var address = new Address
        {
            CustomerId = customerId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Line1 = request.Line1,
            Line2 = request.Line2,
            City = request.City,
            State = request.State,
            Pincode = request.Pincode,
            Country = request.Country,
            IsDefault = request.IsDefault
        };

        await _addressRepository.AddAsync(address);
        await _addressRepository.SaveChangesAsync();
        return MapToAddressDto(address);
    }

    public async Task<AddressDto> UpdateAddressAsync(Guid addressId, CreateAddressRequest request)
    {
        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null)
        {
            throw new Exception("Address not found");
        }

        // If this is set as default, unset other defaults
        if (request.IsDefault && !address.IsDefault)
        {
            var addresses = await _addressRepository.GetByCustomerIdAsync(address.CustomerId);
            foreach (var addr in addresses.Where(a => a.IsDefault))
            {
                addr.IsDefault = false;
                await _addressRepository.UpdateAsync(addr);
            }
            await _addressRepository.SaveChangesAsync();
        }

        address.FullName = request.FullName;
        address.PhoneNumber = request.PhoneNumber;
        address.Line1 = request.Line1;
        address.Line2 = request.Line2;
        address.City = request.City;
        address.State = request.State;
        address.Pincode = request.Pincode;
        address.Country = request.Country;
        address.IsDefault = request.IsDefault;

        await _addressRepository.UpdateAsync(address);
        await _addressRepository.SaveChangesAsync();
        return MapToAddressDto(address);
    }

    public async Task<bool> DeleteAddressAsync(Guid addressId)
    {
        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null)
        {
            return false;
        }

        await _addressRepository.DeleteAsync(addressId);
        await _addressRepository.SaveChangesAsync();
        return true;
    }

    public async Task<AddressDto> SetDefaultAddressAsync(Guid customerId, Guid addressId)
    {
        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address == null || address.CustomerId != customerId)
        {
            throw new Exception("Address not found");
        }

        // Unset other defaults
        var addresses = await _addressRepository.GetByCustomerIdAsync(customerId);
        foreach (var addr in addresses.Where(a => a.IsDefault))
        {
            addr.IsDefault = false;
            await _addressRepository.UpdateAsync(addr);
        }
        
        address.IsDefault = true;
        await _addressRepository.UpdateAsync(address);
        await _addressRepository.SaveChangesAsync();

        return MapToAddressDto(address);
    }

    private AddressDto MapToAddressDto(Address address)
    {
        return new AddressDto
        {
            Id = address.Id,
            CustomerId = address.CustomerId,
            FullName = address.FullName,
            PhoneNumber = address.PhoneNumber,
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            Pincode = address.Pincode,
            Country = address.Country,
            IsDefault = address.IsDefault,
            CreatedAt = address.CreatedAt
        };
    }
}
