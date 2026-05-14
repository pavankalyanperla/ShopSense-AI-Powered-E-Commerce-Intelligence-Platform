using Microsoft.EntityFrameworkCore;
using ReviewService.Domain.Entities;

namespace ReviewService.Infrastructure.Data;

public class ReviewDbContext : DbContext
{
    public ReviewDbContext(DbContextOptions<ReviewDbContext> options) : base(options) { }

    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewReply> ReviewReplies => Set<ReviewReply>();
    public DbSet<ReviewFlag> ReviewFlags => Set<ReviewFlag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.ProductId);
            e.HasIndex(r => r.CustomerId);
            e.HasIndex(r => new { r.CustomerId, r.ProductId }).IsUnique();
            e.Property(r => r.Title).HasMaxLength(200).IsRequired();
            e.Property(r => r.Body).HasMaxLength(2000).IsRequired();
            e.Property(r => r.CustomerName).HasMaxLength(100);
            e.Property(r => r.ProductName).HasMaxLength(300);
        });

        modelBuilder.Entity<ReviewReply>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.ReplyText).HasMaxLength(1000).IsRequired();
            e.HasOne(r => r.Review)
                .WithMany(rv => rv.Replies)
                .HasForeignKey(r => r.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReviewFlag>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Reason).HasMaxLength(500);
            e.HasOne(f => f.Review)
                .WithMany(r => r.Flags)
                .HasForeignKey(f => f.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
