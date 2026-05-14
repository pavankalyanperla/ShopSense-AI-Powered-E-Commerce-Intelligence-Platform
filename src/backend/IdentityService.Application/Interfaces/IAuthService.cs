using IdentityService.Application.DTOs;

namespace IdentityService.Application.Interfaces;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> GoogleAuthAsync(GoogleAuthRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId, string token);
    Task<UserDto> GetUserByIdAsync(Guid userId);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
}
