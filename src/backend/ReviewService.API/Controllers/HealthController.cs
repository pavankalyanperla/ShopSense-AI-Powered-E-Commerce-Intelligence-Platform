using Microsoft.AspNetCore.Mvc;

namespace ReviewService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "ReviewService", status = "healthy", timestamp = DateTime.UtcNow });
}
