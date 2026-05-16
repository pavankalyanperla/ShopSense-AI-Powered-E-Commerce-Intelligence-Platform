using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;

namespace NotificationService.Infrastructure.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options)
        : base(options) { }

    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(n => n.Id);
            e.HasIndex(n => n.RecipientEmail);
            e.HasIndex(n => n.Status);
            e.HasIndex(n => n.CreatedAt);
            e.Property(n => n.Type).HasMaxLength(100).IsRequired();
            e.Property(n => n.RecipientEmail).HasMaxLength(256).IsRequired();
            e.Property(n => n.Subject).HasMaxLength(500).IsRequired();
            e.Property(n => n.BodyHtml).HasColumnType("nvarchar(max)");
        });
    }
}
