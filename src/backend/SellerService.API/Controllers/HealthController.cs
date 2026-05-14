using Microsoft.AspNetCore.Mvc;

namespace SellerService.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { service = "SellerService", status = "healthy", timestamp = DateTime.UtcNow });
}
