using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using OrderService.Application.Interfaces;

namespace OrderService.Infrastructure.Clients;

public class FraudClient : IFraudClient
{
    private readonly HttpClient _http;
    private readonly ILogger<FraudClient> _logger;

    public FraudClient(HttpClient http, ILogger<FraudClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<(double Score, bool IsFraud, string RiskLevel)> CheckAsync(
        decimal amount,
        string paymentMethod,
        int customerAge = 30,
        int accountAgeDays = 365,
        int transactionHour = 12,
        string device = "Mobile",
        string category = "Electronics",
        int quantity = 1)
    {
        try
        {
            var payload = new
            {
                transaction_amount = (double)amount,
                payment_method = paymentMethod,
                product_category = category,
                quantity = quantity,
                customer_age = customerAge,
                account_age_days = accountAgeDays,
                transaction_hour = transactionHour,
                device_used = device
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await _http.PostAsync("/predict/fraud", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("FraudService returned {Status}", response.StatusCode);
                return (0.0, false, "LOW");
            }

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<FraudResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return (
                result?.FraudProbability ?? 0.0,
                result?.IsFraud ?? false,
                result?.RiskLevel ?? "LOW"
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "FraudService unavailable — defaulting to APPROVE");
            return (0.0, false, "LOW");
        }
    }

    private record FraudResponse(double FraudProbability, bool IsFraud, string RiskLevel);
}
