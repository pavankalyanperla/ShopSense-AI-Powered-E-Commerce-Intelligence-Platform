namespace SellerService.Application.DTOs;

public class SubmitKycRequest
{
    public string AadhaarNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
}
