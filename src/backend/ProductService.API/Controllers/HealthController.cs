using Microsoft.AspNetCore.Mvc;

namespace ProductService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "ProductService", status = "healthy", timestamp = DateTime.UtcNow });
}
