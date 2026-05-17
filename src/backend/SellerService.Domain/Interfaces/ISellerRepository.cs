using SellerService.Domain.Entities;
using SellerService.Domain.Enums;

namespace SellerService.Domain.Interfaces;

public interface ISellerRepository
{
    Task<Seller?> GetByIdAsync(Guid id);
    Task<Seller?> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Seller>> GetAllAsync(SellerStatus? status);
    Task<bool> ExistsAsync(Guid userId);
    Task AddAsync(Seller seller);
    Task UpdateAsync(Seller seller);
    Task SubmitKycDocumentAsync(Guid sellerId, KycDocument kycDoc, SellerStatus newStatus, string? rejectionReason, DateTime? approvedAt);
    Task SaveChangesAsync();
}
