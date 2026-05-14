using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace IdentityService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly string _googleClientId;

    public AuthService(
        IUserRepository userRepository,
        IOtpRepository otpRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
        _emailService = emailService;
        _googleClientId = configuration["GoogleAuth:ClientId"] ?? "";
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        // Create user
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = request.Role,
            IsEmailVerified = false
        };

        await _userRepository.CreateAsync(user);

        // Generate OTP
        var otpCode = GenerateOtpCode();
        var otpToken = new OtpToken
        {
            UserId = user.Id,
            Code = otpCode,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };

        await _otpRepository.CreateAsync(otpToken);

        // Send OTP email
        await _emailService.SendOtpEmailAsync(user.Email, user.FullName, otpCode);

        return MapToUserDto(user);
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var otpToken = await _otpRepository.GetValidOtpAsync(user.Id, request.Code);
        if (otpToken == null)
        {
            throw new InvalidOperationException("Invalid or expired OTP");
        }

        // Mark OTP as used
        await _otpRepository.MarkAsUsedAsync(otpToken.Id);

        // Mark email as verified
        user.IsEmailVerified = true;
        await _userRepository.UpdateAsync(user);

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName);

        // Generate tokens
        var jwtToken = _tokenService.GenerateJwtToken(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return new AuthResponse
        {
            Token = jwtToken,
            RefreshToken = refreshToken,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsEmailVerified)
        {
            throw new UnauthorizedAccessException("Email not verified. Please verify your email first.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        // Generate tokens
        var jwtToken = _tokenService.GenerateJwtToken(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return new AuthResponse
        {
            Token = jwtToken,
            RefreshToken = refreshToken,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> GoogleAuthAsync(GoogleAuthRequest request)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _googleClientId }
            });

            var user = await _userRepository.GetByGoogleIdAsync(payload.Subject);
            
            if (user == null)
            {
                // Check if email exists
                user = await _userRepository.GetByEmailAsync(payload.Email);
                
                if (user == null)
                {
                    // Create new user
                    user = new User
                    {
                        FullName = payload.Name,
                        Email = payload.Email,
                        GoogleId = payload.Subject,
                        ProfilePicture = payload.Picture,
                        IsEmailVerified = true,
                        Role = "Customer",
                        PasswordHash = "" // No password for Google auth
                    };

                    await _userRepository.CreateAsync(user);
                    await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName);
                }
                else
                {
                    // Link Google account to existing user
                    user.GoogleId = payload.Subject;
                    user.ProfilePicture = payload.Picture;
                    user.IsEmailVerified = true;
                    await _userRepository.UpdateAsync(user);
                }
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Account is deactivated");
            }

            // Generate tokens
            var jwtToken = _tokenService.GenerateJwtToken(user);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

            return new AuthResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                User = MapToUserDto(user)
            };
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedAccessException("Invalid Google token");
        }
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var tokenEntity = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        
        if (tokenEntity == null || tokenEntity.IsRevoked || tokenEntity.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = await _userRepository.GetByIdAsync(tokenEntity.UserId);
        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("User not found or inactive");
        }

        // Generate new tokens
        var jwtToken = _tokenService.GenerateJwtToken(user);
        var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        // Revoke old refresh token
        await _refreshTokenRepository.RevokeAsync(tokenEntity.Id);

        return new AuthResponse
        {
            Token = jwtToken,
            RefreshToken = newRefreshToken,
            User = MapToUserDto(user)
        };
    }

    public async Task LogoutAsync(Guid userId, string token)
    {
        // Blacklist the JWT token
        await _tokenService.BlacklistTokenAsync(token);

        // Revoke all refresh tokens for the user
        await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
    }

    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (!string.IsNullOrEmpty(request.FullName))
        {
            user.FullName = request.FullName;
        }

        if (!string.IsNullOrEmpty(request.ProfilePicture))
        {
            user.ProfilePicture = request.ProfilePicture;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return MapToUserDto(user);
    }

    private static string GenerateOtpCode()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified,
            ProfilePicture = user.ProfilePicture
        };
    }
}
