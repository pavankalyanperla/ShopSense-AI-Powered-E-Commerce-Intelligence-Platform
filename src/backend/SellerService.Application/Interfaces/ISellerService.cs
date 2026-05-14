using SellerService.Application.DTOs;

namespace SellerService.Application.Interfaces;

public interface ISellerService
{
    Task<SellerDto> RegisterAsync(RegisterSellerRequest request, Guid userId);
    Task<SellerDto?> GetByIdAsync(Guid id);
    Task<SellerDto?> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<SellerDto>> GetAllAsync();
    Task<SellerDto?> SubmitKycAsync(Guid sellerId, SubmitKycRequest request);
    Task<SellerDto?> GetKycStatusAsync(Guid sellerId);
    Task<IEnumerable<EarningsDto>> GetEarningsAsync(Guid sellerId);
    Task<ListingCoachResponse> GetListingCoachAsync(ListingCoachRequest request);
    Task<bool> UpdateStatusAsync(Guid sellerId, string status);
}
