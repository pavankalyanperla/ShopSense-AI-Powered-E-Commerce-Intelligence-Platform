using FluentAssertions;
using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Application.Services;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace IdentityService.Tests.Application;

[TestFixture]
public class AuthServiceTests
{
    private Mock<IUserRepository> _userRepo;
    private Mock<IOtpRepository> _otpRepo;
    private Mock<IRefreshTokenRepository> _refreshTokenRepo;
    private Mock<ITokenService> _tokenService;
    private Mock<IEmailService> _emailService;
    private Mock<IConfiguration> _config;
    private AuthService _authService;

    [SetUp]
    public void SetUp()
    {
        _userRepo = new Mock<IUserRepository>();
        _otpRepo = new Mock<IOtpRepository>();
        _refreshTokenRepo = new Mock<IRefreshTokenRepository>();
        _tokenService = new Mock<ITokenService>();
        _emailService = new Mock<IEmailService>();
        _config = new Mock<IConfiguration>();

        _config.Setup(c => c["GoogleAuth:ClientId"]).Returns("test-client-id");

        _authService = new AuthService(
            _userRepo.Object,
            _otpRepo.Object,
            _refreshTokenRepo.Object,
            _tokenService.Object,
            _emailService.Object,
            _config.Object);
    }

    [Test]
    public async Task Register_NewEmail_ReturnsUserDto()
    {
        _userRepo.Setup(r => r.EmailExistsAsync("new@test.com")).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
                 .ReturnsAsync((User u) => u);
        _otpRepo.Setup(r => r.CreateAsync(It.IsAny<OtpToken>()))
                .ReturnsAsync(new OtpToken());
        _emailService.Setup(e => e.SendOtpEmailAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        var result = await _authService.RegisterAsync(new RegisterRequest
        {
            FullName = "Test User",
            Email = "new@test.com",
            Password = "SecurePass@123",
            Role = "Customer"
        });

        result.Should().NotBeNull();
        result.Email.Should().Be("new@test.com");
        result.FullName.Should().Be("Test User");
        result.IsEmailVerified.Should().BeFalse();
    }

    [Test]
    public async Task Register_ExistingEmail_ThrowsInvalidOperationException()
    {
        _userRepo.Setup(r => r.EmailExistsAsync("exists@test.com")).ReturnsAsync(true);

        Func<Task> act = () => _authService.RegisterAsync(new RegisterRequest
        {
            FullName = "Test User",
            Email = "exists@test.com",
            Password = "SecurePass@123"
        });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Email already registered");
    }

    [Test]
    public async Task Register_CreatesUserWithCorrectRole()
    {
        User? captured = null;
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
                 .Callback<User>(u => captured = u)
                 .ReturnsAsync((User u) => u);
        _otpRepo.Setup(r => r.CreateAsync(It.IsAny<OtpToken>()))
                .ReturnsAsync(new OtpToken());
        _emailService.Setup(e => e.SendOtpEmailAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        await _authService.RegisterAsync(new RegisterRequest
        {
            FullName = "Seller User",
            Email = "seller@test.com",
            Password = "Pass@1234",
            Role = "Seller"
        });

        captured.Should().NotBeNull();
        captured!.Role.Should().Be("Seller");
    }

    [Test]
    public async Task Login_ValidCredentials_ReturnsAuthResponse()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("ValidPass@1", workFactor: 4);
        var user = new User
        {
            Email = "user@test.com",
            PasswordHash = hash,
            IsEmailVerified = true,
            IsActive = true,
            FullName = "Test User",
            Role = "Customer"
        };

        _userRepo.Setup(r => r.GetByEmailAsync("user@test.com")).ReturnsAsync(user);
        _tokenService.Setup(t => t.GenerateJwtToken(user)).Returns("jwt-token");
        _tokenService.Setup(t => t.GenerateRefreshTokenAsync(user.Id))
                     .ReturnsAsync("refresh-token");

        var result = await _authService.LoginAsync(new LoginRequest
        {
            Email = "user@test.com",
            Password = "ValidPass@1"
        });

        result.Token.Should().Be("jwt-token");
        result.RefreshToken.Should().Be("refresh-token");
        result.User.Email.Should().Be("user@test.com");
    }

    [Test]
    public async Task Login_WrongPassword_ThrowsUnauthorizedException()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("CorrectPass@1", workFactor: 4);
        var user = new User
        {
            Email = "user@test.com",
            PasswordHash = hash,
            IsEmailVerified = true,
            IsActive = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("user@test.com")).ReturnsAsync(user);

        Func<Task> act = () => _authService.LoginAsync(new LoginRequest
        {
            Email = "user@test.com",
            Password = "WrongPass@1"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Test]
    public async Task Login_UnverifiedEmail_ThrowsUnauthorizedException()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Pass@1234", workFactor: 4);
        var user = new User
        {
            Email = "unverified@test.com",
            PasswordHash = hash,
            IsEmailVerified = false,
            IsActive = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("unverified@test.com")).ReturnsAsync(user);

        Func<Task> act = () => _authService.LoginAsync(new LoginRequest
        {
            Email = "unverified@test.com",
            Password = "Pass@1234"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*not verified*");
    }

    [Test]
    public async Task Login_NonExistentUser_ThrowsUnauthorizedException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("ghost@test.com"))
                 .ReturnsAsync((User?)null);

        Func<Task> act = () => _authService.LoginAsync(new LoginRequest
        {
            Email = "ghost@test.com",
            Password = "Pass@1234"
        });

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Test]
    public async Task Register_SendsOtpEmail()
    {
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>()))
                 .ReturnsAsync((User u) => u);
        _otpRepo.Setup(r => r.CreateAsync(It.IsAny<OtpToken>()))
                .ReturnsAsync(new OtpToken());
        _emailService.Setup(e => e.SendOtpEmailAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        await _authService.RegisterAsync(new RegisterRequest
        {
            FullName = "Email Test",
            Email = "emailtest@test.com",
            Password = "Pass@1234",
            Role = "Customer"
        });

        _emailService.Verify(e => e.SendOtpEmailAsync(
            "emailtest@test.com",
            "Email Test",
            It.IsAny<string>()), Times.Once);
    }
}
