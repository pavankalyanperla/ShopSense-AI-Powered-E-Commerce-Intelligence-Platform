using Microsoft.AspNetCore.Mvc;

namespace IdentityService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "IdentityService", status = "healthy", timestamp = DateTime.UtcNow });
}
