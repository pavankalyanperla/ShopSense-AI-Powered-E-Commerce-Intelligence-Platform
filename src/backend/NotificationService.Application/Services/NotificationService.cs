using NotificationService.Domain.Entities;
using NotificationService.Domain.Enums;
using NotificationService.Domain.Interfaces;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Messages;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace NotificationService.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly IEmailService _email;
    private readonly ILogger<NotificationService> _logger;
    private readonly IConfiguration _config;

    public NotificationService(
        INotificationRepository repo,
        IEmailService email,
        ILogger<NotificationService> logger,
        IConfiguration config)
    {
        _repo = repo;
        _email = email;
        _logger = logger;
        _config = config;
    }

    public async Task SendOrderConfirmationAsync(OrderPlacedMessage message)
    {
        var subject = $"Order Confirmed ✅ — {message.OrderNumber} | ShopSense";
        var body = EmailTemplateService.OrderConfirmation(message);
        await SendAndLogAsync("OrderConfirmation", message.CustomerEmail,
            message.CustomerName, subject, body, message.OrderId.ToString());
    }

    public async Task SendOrderStatusUpdateAsync(OrderStatusMessage message)
    {
        var subject = $"Order {message.NewStatus} — {message.OrderNumber} | ShopSense";
        var body = EmailTemplateService.OrderStatusUpdate(message);
        await SendAndLogAsync($"OrderStatus_{message.NewStatus}", message.CustomerEmail,
            message.CustomerName, subject, body, message.OrderId.ToString());
    }

    public async Task SendFraudAlertAsync(FraudCheckMessage message)
    {
        var adminEmail = _config["Admin:Email"] ?? _config["Gmail:User"] ?? string.Empty;
        if (string.IsNullOrEmpty(adminEmail)) return;

        var subject = $"🚨 Fraud Alert — Order {message.OrderId} | ShopSense Admin";
        var body = EmailTemplateService.FraudAlert(message, adminEmail);
        await SendAndLogAsync("FraudAlert", adminEmail, "ShopSense Admin",
            subject, body, message.OrderId.ToString());
    }

    public async Task SendKycApprovedAsync(KycDecisionMessage message)
    {
        var subject = "🎉 KYC Approved — Start Selling on ShopSense!";
        var body = EmailTemplateService.KycApproved(message);
        await SendAndLogAsync("KycApproved", message.SellerEmail,
            message.BusinessName, subject, body, message.SellerId.ToString());
    }

    public async Task SendKycRejectedAsync(KycDecisionMessage message)
    {
        var subject = "⚠️ KYC Review — Action Required | ShopSense";
        var body = EmailTemplateService.KycRejected(message);
        await SendAndLogAsync("KycRejected", message.SellerEmail,
            message.BusinessName, subject, body, message.SellerId.ToString());
    }

    public async Task<IEnumerable<NotificationDto>> GetAllAsync(int page, int pageSize)
    {
        var notifications = await _repo.GetAllAsync(page, pageSize);
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Type = n.Type,
            RecipientEmail = n.RecipientEmail,
            RecipientName = n.RecipientName,
            Subject = n.Subject,
            Status = n.Status.ToString(),
            ErrorMessage = n.ErrorMessage,
            RetryCount = n.RetryCount,
            ReferenceId = n.ReferenceId,
            CreatedAt = n.CreatedAt,
            SentAt = n.SentAt
        });
    }

    public async Task RetryFailedAsync()
    {
        var failed = await _repo.GetFailedAsync();
        foreach (var notification in failed.Where(n => n.RetryCount < 3))
        {
            _logger.LogInformation("Retrying notification {Id}", notification.Id);
            var success = await _email.SendAsync(
                notification.RecipientEmail,
                notification.RecipientName,
                notification.Subject,
                notification.BodyHtml);

            notification.RetryCount++;
            notification.Status = success ? NotificationStatus.Sent : NotificationStatus.Failed;
            if (success) notification.SentAt = DateTime.UtcNow;

            await _repo.UpdateAsync(notification);
        }
        await _repo.SaveChangesAsync();
    }

    private async Task SendAndLogAsync(
        string type, string toEmail, string toName,
        string subject, string body, string? referenceId = null)
    {
        var notification = new Notification
        {
            Type = type,
            RecipientEmail = toEmail,
            RecipientName = toName,
            Subject = subject,
            BodyHtml = body,
            ReferenceId = referenceId,
            Status = NotificationStatus.Pending
        };

        await _repo.AddAsync(notification);
        await _repo.SaveChangesAsync();

        var success = await _email.SendAsync(toEmail, toName, subject, body);

        notification.Status = success ? NotificationStatus.Sent : NotificationStatus.Failed;
        if (success) notification.SentAt = DateTime.UtcNow;

        if (!success)
            _logger.LogWarning("Failed to send {Type} email to {Email}", type, toEmail);

        await _repo.UpdateAsync(notification);
        await _repo.SaveChangesAsync();
    }
}
