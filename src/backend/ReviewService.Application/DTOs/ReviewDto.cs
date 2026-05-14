namespace ReviewService.Application.DTOs;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string SentimentLabel { get; set; } = string.Empty;
    public double SentimentScore { get; set; }
    public bool IsVerifiedPurchase { get; set; }
    public bool IsFlagged { get; set; }
    public List<ReviewReplyDto> Replies { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ReviewReplyDto
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public string ReplyText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
