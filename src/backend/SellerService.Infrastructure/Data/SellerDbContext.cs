using Microsoft.EntityFrameworkCore;
using SellerService.Domain.Entities;

namespace SellerService.Infrastructure.Data;

public class SellerDbContext : DbContext
{
    public SellerDbContext(DbContextOptions<SellerDbContext> options) : base(options) { }

    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<KycDocument> KycDocuments => Set<KycDocument>();
    public DbSet<SellerEarning> SellerEarnings => Set<SellerEarning>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Seller>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.BusinessName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.RejectionReason).HasMaxLength(500);
            entity.Property(e => e.SuspensionReason).HasMaxLength(500);
            entity.Property(e => e.TotalEarnings).HasPrecision(18, 2);
            entity.Property(e => e.PendingPayout).HasPrecision(18, 2);

            entity.HasOne(e => e.KycDocument)
                .WithOne(k => k.Seller)
                .HasForeignKey<KycDocument>(k => k.SellerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Earnings)
                .WithOne(e => e.Seller)
                .HasForeignKey(e => e.SellerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<KycDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AadhaarNumber).HasMaxLength(12);
            entity.Property(e => e.PanNumber).HasMaxLength(10);
            entity.Property(e => e.GstNumber).HasMaxLength(15);
            entity.Property(e => e.BankAccountNumber).HasMaxLength(50);
            entity.Property(e => e.IfscCode).HasMaxLength(11);
            entity.Property(e => e.BankName).HasMaxLength(100);
            entity.Property(e => e.MockApiResponse).HasMaxLength(1000);
        });

        modelBuilder.Entity<SellerEarning>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GrossAmount).HasPrecision(18, 2);
            entity.Property(e => e.CommissionRate).HasPrecision(5, 2);
            entity.Property(e => e.CommissionAmount).HasPrecision(18, 2);
            entity.Property(e => e.NetAmount).HasPrecision(18, 2);
            entity.Property(e => e.ProductName).HasMaxLength(200);
            entity.Property(e => e.PeriodMonth).HasMaxLength(7);
        });
    }
}
