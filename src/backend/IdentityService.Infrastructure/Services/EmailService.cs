using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using IdentityService.Application.Interfaces;

namespace IdentityService.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendOtpEmailAsync(string toEmail, string fullName, string otpCode)
    {
        var subject = "Verify Your ShopSense Account";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Welcome to ShopSense!</h2>
                <p>Hi {fullName},</p>
                <p>Thank you for registering with ShopSense. Please use the following OTP to verify your email address:</p>
                <h1 style='color: #4CAF50; letter-spacing: 5px;'>{otpCode}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>ShopSense Team</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
    {
        var subject = "Welcome to ShopSense!";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Welcome to ShopSense!</h2>
                <p>Hi {fullName},</p>
                <p>Your email has been successfully verified. Welcome to the ShopSense community!</p>
                <p>You can now enjoy all the features of our platform:</p>
                <ul>
                    <li>Browse thousands of products</li>
                    <li>Get personalized recommendations</li>
                    <li>Track your orders in real-time</li>
                    <li>Enjoy secure payments</li>
                </ul>
                <p>Happy shopping!</p>
                <br>
                <p>Best regards,<br>ShopSense Team</p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("ShopSense", _configuration["Email:From"]));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_configuration["Email:SmtpHost"], 
                int.Parse(_configuration["Email:SmtpPort"]!), 
                SecureSocketOptions.StartTls);
            
            await client.AuthenticateAsync(_configuration["Email:Username"], 
                _configuration["Email:Password"]);
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // Log the error (in production, use proper logging)
            Console.WriteLine($"Email sending failed: {ex.Message}");
            throw;
        }
    }
}
