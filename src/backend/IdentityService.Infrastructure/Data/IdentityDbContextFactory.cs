using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace IdentityService.Infrastructure.Data;

public class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=ShopSense_IdentityDB;Trusted_Connection=True;TrustServerCertificate=True");

        return new IdentityDbContext(optionsBuilder.Options);
    }
}
