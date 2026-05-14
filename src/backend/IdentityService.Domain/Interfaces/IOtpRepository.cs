using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Interfaces;

public interface IOtpRepository
{
    Task<OtpToken> CreateAsync(OtpToken otpToken);
    Task<OtpToken?> GetValidOtpAsync(Guid userId, string code);
    Task MarkAsUsedAsync(Guid otpId);
}
