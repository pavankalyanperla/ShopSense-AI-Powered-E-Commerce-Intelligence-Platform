namespace ReviewService.Domain.Entities;

public class ReviewReply
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public string ReplyText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
