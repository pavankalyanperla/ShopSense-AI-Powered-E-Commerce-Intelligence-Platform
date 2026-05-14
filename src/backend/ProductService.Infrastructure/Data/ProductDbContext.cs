using Microsoft.EntityFrameworkCore;
using ProductService.Domain.Entities;

namespace ProductService.Infrastructure.Data;

public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasIndex(p => p.SKU).IsUnique();
            e.HasIndex(p => p.SellerId);
            e.HasIndex(p => p.CategoryId);
            e.Property(p => p.Name).HasMaxLength(300).IsRequired();
            e.Property(p => p.Brand).HasMaxLength(100);
            e.Property(p => p.BasePrice).HasPrecision(18, 2);
            e.Property(p => p.DiscountedPrice).HasPrecision(18, 2);
            e.Property(p => p.DiscountPercent).HasPrecision(5, 2);
            e.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
            e.HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductImage>(e =>
        {
            e.HasKey(i => i.Id);
            e.HasOne(i => i.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductVariant>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.AdditionalPrice).HasPrecision(18, 2);
            e.HasOne(v => v.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductSpecification>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Product)
                .WithMany(p => p.Specifications)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Wishlist>(e =>
        {
            e.HasKey(w => w.Id);
            e.HasIndex(w => new { w.CustomerId, w.ProductId }).IsUnique();
            e.HasOne(w => w.Product)
                .WithMany()
                .HasForeignKey(w => w.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

