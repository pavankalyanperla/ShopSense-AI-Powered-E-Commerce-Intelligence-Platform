namespace ReviewService.Domain.Enums;

public enum SentimentLabel
{
    Positive = 1,
    Neutral = 2,
    Negative = 3
}

public enum FlagStatus
{
    Pending = 1,
    Reviewed = 2,
    Dismissed = 3,
    Removed = 4
}
