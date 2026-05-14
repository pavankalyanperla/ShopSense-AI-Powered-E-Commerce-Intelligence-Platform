using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Interfaces;

namespace IdentityService.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IConnectionMultiplexer _redis;

    public TokenService(
        IConfiguration configuration,
        IRefreshTokenRepository refreshTokenRepository,
        IConnectionMultiplexer redis)
    {
        _configuration = configuration;
        _refreshTokenRepository = refreshTokenRepository;
        _redis = redis;
    }

    public string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> GenerateRefreshTokenAsync(Guid userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var token = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _refreshTokenRepository.CreateAsync(refreshToken);
        return token;
    }

    public async Task<bool> ValidateRefreshTokenAsync(string token)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(token);
        return refreshToken != null && !refreshToken.IsRevoked && refreshToken.ExpiresAt > DateTime.UtcNow;
    }

    public async Task BlacklistTokenAsync(string token)
    {
        var db = _redis.GetDatabase();
        var handler = new JwtSecurityTokenHandler();
        
        if (handler.CanReadToken(token))
        {
            var jwtToken = handler.ReadJwtToken(token);
            var expiry = jwtToken.ValidTo - DateTime.UtcNow;
            
            if (expiry > TimeSpan.Zero)
            {
                await db.StringSetAsync($"blacklist:{token}", "true", expiry);
            }
        }
    }

    public async Task<bool> IsTokenBlacklistedAsync(string token)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync($"blacklist:{token}");
    }
}
