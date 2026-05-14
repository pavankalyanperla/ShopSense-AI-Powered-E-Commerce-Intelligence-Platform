using System.Text.RegularExpressions;
using SellerService.Application.Interfaces;

namespace SellerService.Application.Services;

public class KycVerificationService : IKycVerificationService
{
    // Mock KYC verification with regex pattern validation
    public Task<(bool IsValid, string Status, string Message)> VerifyAsync(string documentType, string documentNumber)
    {
        var isValid = documentType.ToUpper() switch
        {
            "AADHAAR" => Regex.IsMatch(documentNumber, @"^\d{12}$"),
            "PAN" => Regex.IsMatch(documentNumber, @"^[A-Z]{5}\d{4}[A-Z]$"),
            "GST" => Regex.IsMatch(documentNumber, @"^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$"),
            "PASSPORT" => Regex.IsMatch(documentNumber, @"^[A-Z]\d{7}$"),
            _ => false
        };

        var status = isValid ? "Verified" : "Failed";
        var message = isValid 
            ? $"{documentType} verification successful" 
            : $"Invalid {documentType} format";

        return Task.FromResult((isValid, status, message));
    }
}
