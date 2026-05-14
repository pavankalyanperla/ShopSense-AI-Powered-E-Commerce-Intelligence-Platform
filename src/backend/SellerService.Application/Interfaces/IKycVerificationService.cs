namespace SellerService.Application.Interfaces;

public interface IKycVerificationService
{
    Task<(bool IsValid, string Status, string Message)> VerifyAsync(string documentType, string documentNumber);
}
