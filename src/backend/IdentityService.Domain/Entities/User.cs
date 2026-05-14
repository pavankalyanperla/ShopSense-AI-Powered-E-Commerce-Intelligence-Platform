namespace IdentityService.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Customer | Seller | Admin
    public bool IsEmailVerified { get; set; } = false;
    public string? GoogleId { get; set; }
    public string? ProfilePicture { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<OtpToken> OtpTokens { get; set; } = new List<OtpToken>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
