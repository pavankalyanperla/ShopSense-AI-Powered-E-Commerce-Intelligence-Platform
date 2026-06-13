using FluentAssertions;
using NUnit.Framework;

namespace IdentityService.Tests.Application;

[TestFixture]
public class PasswordTests
{
    [Test]
    public void HashPassword_GeneratesNonEmptyHash()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("TestPass123", workFactor: 4);
        hash.Should().NotBeNullOrEmpty();
    }

    [Test]
    public void HashPassword_StartsWithBcryptPrefix()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("TestPass123", workFactor: 4);
        hash.Should().StartWith("$2");
    }

    [Test]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        const string password = "Correct@Pass1";
        var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4);
        BCrypt.Net.BCrypt.Verify(password, hash).Should().BeTrue();
    }

    [Test]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("RightPass@1", workFactor: 4);
        BCrypt.Net.BCrypt.Verify("WrongPass@1", hash).Should().BeFalse();
    }

    [Test]
    public void HashPassword_SamePassword_ProducesDifferentHashes()
    {
        const string password = "SamePassword@1";
        var hash1 = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4);
        var hash2 = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4);
        hash1.Should().NotBe(hash2);
    }

    [Test]
    public void Verify_EmptyPassword_DoesNotMatchHash()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("NotEmpty@1", workFactor: 4);
        BCrypt.Net.BCrypt.Verify("", hash).Should().BeFalse();
    }
}
