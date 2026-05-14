using Microsoft.AspNetCore.Mvc;

namespace NotificationService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "NotificationService", status = "healthy", timestamp = DateTime.UtcNow });
}
