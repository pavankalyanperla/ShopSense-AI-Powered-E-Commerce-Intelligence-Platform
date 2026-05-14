using IdentityService.Domain.Entities;

namespace IdentityService.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
    Task<string> GenerateRefreshTokenAsync(Guid userId);
    Task<bool> ValidateRefreshTokenAsync(string token);
    Task BlacklistTokenAsync(string token);
    Task<bool> IsTokenBlacklistedAsync(string token);
}
