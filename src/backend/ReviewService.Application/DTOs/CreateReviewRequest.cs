namespace ReviewService.Application.DTOs;

public class CreateReviewRequest
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid OrderId { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}
