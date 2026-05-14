using Microsoft.EntityFrameworkCore;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Interfaces;
using IdentityService.Infrastructure.Data;

namespace IdentityService.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IdentityDbContext _context;

    public RefreshTokenRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task RevokeAsync(Guid tokenId)
    {
        var token = await _context.RefreshTokens.FindAsync(tokenId);
        if (token != null)
        {
            token.IsRevoked = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokeAllUserTokensAsync(Guid userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }

        await _context.SaveChangesAsync();
    }
}
