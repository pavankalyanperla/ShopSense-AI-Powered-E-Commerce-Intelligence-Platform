using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using ReviewService.Application.Interfaces;

namespace ReviewService.Infrastructure.Clients;

public class ProductClient : IProductClient
{
    private readonly HttpClient _http;
    private readonly ILogger<ProductClient> _logger;

    public ProductClient(HttpClient http, ILogger<ProductClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task UpdateRatingAsync(Guid productId, double avgRating, int reviewCount)
    {
        try
        {
            var payload = JsonSerializer.Serialize(new { averageRating = avgRating, reviewCount = reviewCount });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            await _http.PutAsync("/api/v1/products/{productId}/rating", content);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to update rating for product {ProductId}", productId);
        }
    }

    public async Task UpdateSentimentAsync(Guid productId, string label, double score)
    {
        try
        {
            var payload = JsonSerializer.Serialize(new { label = label.ToUpper(), score });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            await _http.PutAsync("/api/v1/products/{productId}/sentiment", content);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to update sentiment for product {ProductId}", productId);
        }
    }
}
