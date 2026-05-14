using ReviewService.Domain.Enums;

namespace ReviewService.Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid OrderId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public SentimentLabel SentimentLabel { get; set; } = SentimentLabel.Neutral;
    public double SentimentScore { get; set; } = 0;
    public bool IsVerifiedPurchase { get; set; } = true;
    public bool IsFlagged { get; set; } = false;
    public bool IsApproved { get; set; } = true;
    public ICollection<ReviewReply> Replies { get; set; } = new List<ReviewReply>();
    public ICollection<ReviewFlag> Flags { get; set; } = new List<ReviewFlag>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
