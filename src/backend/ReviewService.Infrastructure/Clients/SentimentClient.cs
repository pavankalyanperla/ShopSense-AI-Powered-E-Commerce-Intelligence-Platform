using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using ReviewService.Application.Interfaces;

namespace ReviewService.Infrastructure.Clients;

public class SentimentClient : ISentimentClient
{
    private readonly HttpClient _http;
    private readonly ILogger<SentimentClient> _logger;

    public SentimentClient(HttpClient http, ILogger<SentimentClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<(string Label, double Score)> AnalyzeAsync(string reviewText)
    {
        try
        {
            var payload = JsonSerializer.Serialize(new { review_text = reviewText });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("/analyze/sentiment", content);
            
            if (!response.IsSuccessStatusCode)
                return ("NEUTRAL", 0.5);

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SentimentResponse>(json, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            return (result?.Sentiment ?? "NEUTRAL", result?.Confidence ?? 0.5);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SentimentService unavailable — defaulting to NEUTRAL");
            return ("NEUTRAL", 0.5);
        }
    }

    private record SentimentResponse(string Sentiment, double Confidence, string Message);
}
