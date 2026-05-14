using Microsoft.AspNetCore.Mvc;

namespace OrderService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "OrderService", status = "healthy", timestamp = DateTime.UtcNow });
}
