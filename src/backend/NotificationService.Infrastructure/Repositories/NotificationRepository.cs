using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;
using NotificationService.Domain.Interfaces;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly NotificationDbContext _context;

    public NotificationRepository(NotificationDbContext context)
        => _context = context;

    public async Task AddAsync(Notification notification) =>
        await _context.Notifications.AddAsync(notification);

    public Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        return Task.CompletedTask;
    }

    public async Task<IEnumerable<Notification>> GetAllAsync(int page, int pageSize) =>
        await _context.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

    public async Task<IEnumerable<Notification>> GetFailedAsync() =>
        await _context.Notifications
            .Where(n => n.Status == NotificationStatus.Failed && n.RetryCount < 3)
            .ToListAsync();

    public async Task<Notification?> GetByIdAsync(Guid id) =>
        await _context.Notifications.FindAsync(id);

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}
