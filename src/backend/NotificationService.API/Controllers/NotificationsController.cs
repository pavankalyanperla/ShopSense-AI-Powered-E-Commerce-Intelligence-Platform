using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.Interfaces;

namespace NotificationService.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
        => _service = service;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var notifications = await _service.GetAllAsync(page, pageSize);
        return Ok(notifications);
    }

    [HttpPost("retry-failed")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RetryFailed()
    {
        await _service.RetryFailedAsync();
        return Ok(new { message = "Retry initiated for failed notifications" });
    }

    [HttpGet("health")]
    public IActionResult Health() =>
        Ok(new { service = "NotificationService", status = "healthy", timestamp = DateTime.UtcNow });
}
