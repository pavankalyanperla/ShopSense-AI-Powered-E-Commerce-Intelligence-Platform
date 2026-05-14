using IdentityService.Domain.Entities;

namespace IdentityService.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task RevokeAsync(Guid tokenId);
    Task RevokeAllUserTokensAsync(Guid userId);
}
