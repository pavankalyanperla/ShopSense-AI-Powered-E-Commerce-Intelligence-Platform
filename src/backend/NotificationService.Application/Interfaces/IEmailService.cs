namespace NotificationService.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendAsync(string toEmail, string toName, string subject, string htmlBody);
}
