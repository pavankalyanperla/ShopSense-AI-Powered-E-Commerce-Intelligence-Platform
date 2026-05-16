using NotificationService.Domain.Entities;

namespace NotificationService.Domain.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task UpdateAsync(Notification notification);
    Task<IEnumerable<Notification>> GetAllAsync(int page, int pageSize);
    Task<IEnumerable<Notification>> GetFailedAsync();
    Task<Notification?> GetByIdAsync(Guid id);
    Task SaveChangesAsync();
}
