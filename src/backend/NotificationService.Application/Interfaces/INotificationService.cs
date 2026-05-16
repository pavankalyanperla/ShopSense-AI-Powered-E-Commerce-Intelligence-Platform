using NotificationService.Application.DTOs;
using NotificationService.Application.Messages;

namespace NotificationService.Application.Interfaces;

public interface INotificationService
{
    Task SendOrderConfirmationAsync(OrderPlacedMessage message);
    Task SendOrderStatusUpdateAsync(OrderStatusMessage message);
    Task SendFraudAlertAsync(FraudCheckMessage message);
    Task SendKycApprovedAsync(KycDecisionMessage message);
    Task SendKycRejectedAsync(KycDecisionMessage message);
    Task<IEnumerable<NotificationDto>> GetAllAsync(int page, int pageSize);
    Task RetryFailedAsync();
}
