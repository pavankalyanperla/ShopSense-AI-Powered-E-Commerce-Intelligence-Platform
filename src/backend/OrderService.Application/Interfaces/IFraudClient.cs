namespace OrderService.Application.Interfaces;

public interface IFraudClient
{
    Task<(double Score, bool IsFraud, string RiskLevel)> CheckAsync(
        decimal amount,
        string paymentMethod,
        int customerAge = 30,
        int accountAgeDays = 365,
        int transactionHour = 12,
        string device = "Mobile",
        string category = "Electronics",
        int quantity = 1);
}
