namespace ReviewService.Application.Interfaces;

public interface ISentimentClient
{
    Task<(string Label, double Score)> AnalyzeAsync(string reviewText);
}
