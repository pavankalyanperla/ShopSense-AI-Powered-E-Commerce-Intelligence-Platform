using ReviewService.Domain.Enums;

namespace ReviewService.Domain.Entities;

public class ReviewFlag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;
    public Guid FlaggedBy { get; set; }
    public string Reason { get; set; } = string.Empty;
    public FlagStatus Status { get; set; } = FlagStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
