using Microsoft.EntityFrameworkCore;
using OrderService.Domain.Entities;

namespace OrderService.Infrastructure.Data;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasIndex(e => e.CustomerId);
            entity.Property(e => e.SubTotal).HasPrecision(18, 2);
            entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
            entity.Property(e => e.DeliveryCharge).HasPrecision(18, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

            entity.HasOne(e => e.DeliveryAddress)
                .WithMany()
                .HasForeignKey(e => e.DeliveryAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Items)
                .WithOne(e => e.Order)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.StatusHistory)
                .WithOne(e => e.Order)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OrderItem configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.FinalPrice).HasPrecision(18, 2);
        });

        // OrderStatusHistory configuration
        modelBuilder.Entity<OrderStatusHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        // CartItem configuration
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
        });

        // Address configuration
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CustomerId);
        });

        // Coupon configuration
        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
            entity.Property(e => e.MinOrderValue).HasPrecision(18, 2);
            entity.Property(e => e.MaxDiscountAmount).HasPrecision(18, 2);
        });

        // Seed Coupons
        var baseDate = new DateTime(2026, 5, 13, 0, 0, 0, DateTimeKind.Utc);
        
        modelBuilder.Entity<Coupon>().HasData(
            new Coupon
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Code = "WELCOME10",
                Description = "Get 10% off on your first order",
                DiscountType = DiscountType.Percentage,
                DiscountValue = 10,
                MinOrderValue = 500,
                MaxDiscountAmount = 100,
                ExpiresAt = new DateTime(2026, 11, 13, 0, 0, 0, DateTimeKind.Utc),
                UsageLimit = 1000,
                UsedCount = 0,
                IsActive = true,
                CreatedAt = baseDate
            },
            new Coupon
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Code = "FLAT100",
                Description = "Flat ₹100 off on orders above ₹999",
                DiscountType = DiscountType.Flat,
                DiscountValue = 100,
                MinOrderValue = 999,
                MaxDiscountAmount = null,
                ExpiresAt = new DateTime(2026, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                UsageLimit = 500,
                UsedCount = 0,
                IsActive = true,
                CreatedAt = baseDate
            },
            new Coupon
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Code = "DIWALI20",
                Description = "Diwali Special - 20% off up to ₹200",
                DiscountType = DiscountType.Percentage,
                DiscountValue = 20,
                MinOrderValue = 1500,
                MaxDiscountAmount = 200,
                ExpiresAt = new DateTime(2026, 7, 13, 0, 0, 0, DateTimeKind.Utc),
                UsageLimit = 2000,
                UsedCount = 0,
                IsActive = true,
                CreatedAt = baseDate
            }
        );
    }
}
