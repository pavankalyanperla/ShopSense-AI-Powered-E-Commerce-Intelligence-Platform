using Microsoft.EntityFrameworkCore;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Interfaces;
using IdentityService.Infrastructure.Data;

namespace IdentityService.Infrastructure.Repositories;

public class OtpRepository : IOtpRepository
{
    private readonly IdentityDbContext _context;

    public OtpRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<OtpToken> CreateAsync(OtpToken otpToken)
    {
        _context.OtpTokens.Add(otpToken);
        await _context.SaveChangesAsync();
        return otpToken;
    }

    public async Task<OtpToken?> GetValidOtpAsync(Guid userId, string code)
    {
        return await _context.OtpTokens
            .FirstOrDefaultAsync(o => 
                o.UserId == userId && 
                o.Code == code && 
                !o.IsUsed && 
                o.ExpiresAt > DateTime.UtcNow);
    }

    public async Task MarkAsUsedAsync(Guid otpId)
    {
        var otp = await _context.OtpTokens.FindAsync(otpId);
        if (otp != null)
        {
            otp.IsUsed = true;
            await _context.SaveChangesAsync();
        }
    }
}
