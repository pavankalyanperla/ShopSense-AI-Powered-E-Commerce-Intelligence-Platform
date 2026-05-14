using SellerService.Domain.Entities;
using SellerService.Domain.Enums;
using SellerService.Domain.Interfaces;
using SellerService.Application.DTOs;
using SellerService.Application.Interfaces;

namespace SellerService.Application.Services;

public class SellerService : ISellerService
{
    private readonly ISellerRepository _sellers;
    private readonly IKycVerificationService _kycService;

    public SellerService(ISellerRepository sellers, IKycVerificationService kycService)
    {
        _sellers = sellers;
        _kycService = kycService;
    }

    public async Task<SellerDto> RegisterAsync(RegisterSellerRequest request, Guid userId)
    {
        // Check if user already registered as seller
        var existing = await _sellers.GetByUserIdAsync(userId);
        if (existing != null)
            throw new InvalidOperationException("User is already registered as a seller");

        var seller = new Seller
        {
            UserId = userId,
            BusinessName = request.BusinessName,
            PhoneNumber = request.PhoneNumber,
            Status = SellerStatus.Pending
        };

        await _sellers.AddAsync(seller);
        await _sellers.SaveChangesAsync();

        return MapToDto(seller);
    }

    public async Task<SellerDto?> GetByIdAsync(Guid id)
    {
        var seller = await _sellers.GetByIdAsync(id);
        return seller == null ? null : MapToDto(seller);
    }

    public async Task<SellerDto?> GetByUserIdAsync(Guid userId)
    {
        var seller = await _sellers.GetByUserIdAsync(userId);
        return seller == null ? null : MapToDto(seller);
    }

    public async Task<IEnumerable<SellerDto>> GetAllAsync()
    {
        var sellers = await _sellers.GetAllAsync(null);
        return sellers.Select(MapToDto);
    }

    public async Task<SellerDto?> SubmitKycAsync(Guid sellerId, SubmitKycRequest request)
    {
        var seller = await _sellers.GetByIdAsync(sellerId);
        if (seller == null) return null;

        // Verify each KYC document
        var (aadhaarValid, aadhaarStatus, aadhaarMsg) = await _kycService.VerifyAsync("AADHAAR", request.AadhaarNumber);
        var (panValid, panStatus, panMsg) = await _kycService.VerifyAsync("PAN", request.PanNumber);
        var (gstValid, gstStatus, gstMsg) = await _kycService.VerifyAsync("GST", request.GstNumber);

        var kycDoc = new KycDocument
        {
            SellerId = sellerId,
            AadhaarNumber = request.AadhaarNumber,
            PanNumber = request.PanNumber,
            GstNumber = request.GstNumber,
            BankAccountNumber = request.BankAccountNumber,
            IfscCode = request.IfscCode,
            BankName = request.BankName,
            AadhaarStatus = aadhaarValid ? KycVerificationStatus.Verified : KycVerificationStatus.Failed,
            PanStatus = panValid ? KycVerificationStatus.Verified : KycVerificationStatus.Failed,
            GstStatus = gstValid ? KycVerificationStatus.Verified : KycVerificationStatus.Failed,
            BankStatus = KycVerificationStatus.Verified, // Bank details not validated in mock
            MockApiResponse = $"Aadhaar: {aadhaarMsg}, PAN: {panMsg}, GST: {gstMsg}",
            VerifiedAt = (aadhaarValid && panValid && gstValid) ? DateTime.UtcNow : null
        };

        seller.KycDocument = kycDoc;

        // Update seller status based on KYC result
        if (aadhaarValid && panValid && gstValid)
        {
            seller.Status = SellerStatus.Approved;
            seller.ApprovedAt = DateTime.UtcNow;
        }
        else
        {
            seller.Status = SellerStatus.Rejected;
            seller.RejectionReason = "KYC verification failed";
        }

        await _sellers.UpdateAsync(seller);
        await _sellers.SaveChangesAsync();

        return MapToDto(seller);
    }

    public async Task<SellerDto?> GetKycStatusAsync(Guid sellerId)
    {
        var seller = await _sellers.GetByIdAsync(sellerId);
        return seller == null ? null : MapToDto(seller);
    }

    public async Task<IEnumerable<EarningsDto>> GetEarningsAsync(Guid sellerId)
    {
        var seller = await _sellers.GetByIdAsync(sellerId);
        if (seller == null) return Enumerable.Empty<EarningsDto>();

        return seller.Earnings.Select(e => new EarningsDto
        {
            Id = e.Id,
            SellerId = e.SellerId,
            OrderId = e.OrderItemId,
            Amount = e.GrossAmount,
            Commission = e.CommissionAmount,
            NetAmount = e.NetAmount,
            PayoutStatus = e.PayoutStatus.ToString(),
            PayoutDate = null, // Not available in entity
            CreatedAt = e.CreatedAt
        });
    }

    public async Task<ListingCoachResponse> GetListingCoachAsync(ListingCoachRequest request)
    {
        // AI-powered listing optimization engine
        int score = 0;
        var improvements = new List<ImprovementItem>();
        var keywords = new List<string>();

        // Title scoring (max 20 points)
        if (request.Title.Length < 20)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Title",
                Issue = "Title too short",
                Suggestion = "Use 40-80 characters with key product features",
                Impact = 15
            });
        }
        else if (request.Title.Length >= 40 && request.Title.Length <= 80)
        {
            score += 20;
        }
        else if (request.Title.Length > 20)
        {
            score += 10;
            improvements.Add(new ImprovementItem
            {
                Category = "Title",
                Issue = "Title could be optimized",
                Suggestion = "Aim for 40-80 characters for best visibility",
                Impact = 10
            });
        }

        // Description scoring (max 25 points)
        if (request.Description.Length < 100)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Description",
                Issue = "Description too brief",
                Suggestion = "Add detailed product features, benefits, and use cases (300+ words)",
                Impact = 20
            });
        }
        else if (request.Description.Length >= 300)
        {
            score += 25;
        }
        else
        {
            score += 15;
            improvements.Add(new ImprovementItem
            {
                Category = "Description",
                Issue = "Description needs more detail",
                Suggestion = "Expand to 300+ words with features and benefits",
                Impact = 10
            });
        }

        // Images scoring (max 20 points)
        if (request.Images.Count == 0)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Images",
                Issue = "No images uploaded",
                Suggestion = "Add 5-8 high-quality images from different angles",
                Impact = 20
            });
        }
        else if (request.Images.Count >= 5)
        {
            score += 20;
        }
        else
        {
            score += 10;
            improvements.Add(new ImprovementItem
            {
                Category = "Images",
                Issue = $"Only {request.Images.Count} images",
                Suggestion = "Add more images (5-8 recommended)",
                Impact = 10
            });
        }

        // Specifications scoring (max 15 points)
        if (request.Specifications.Count == 0)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Specifications",
                Issue = "No specifications provided",
                Suggestion = "Add detailed specs (dimensions, weight, materials, etc.)",
                Impact = 15
            });
        }
        else if (request.Specifications.Count >= 5)
        {
            score += 15;
        }
        else
        {
            score += 8;
            improvements.Add(new ImprovementItem
            {
                Category = "Specifications",
                Issue = "Limited specifications",
                Suggestion = "Add more detailed specs (5+ recommended)",
                Impact = 7
            });
        }

        // Price competitiveness (max 10 points)
        if (request.Price <= 0)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Pricing",
                Issue = "Invalid price",
                Suggestion = "Set a competitive market price",
                Impact = 10
            });
        }
        else
        {
            score += 10;
        }

        // Stock availability (max 10 points)
        if (request.StockQuantity == 0)
        {
            improvements.Add(new ImprovementItem
            {
                Category = "Stock",
                Issue = "Out of stock",
                Suggestion = "Maintain adequate stock levels",
                Impact = 10
            });
        }
        else if (request.StockQuantity >= 10)
        {
            score += 10;
        }
        else
        {
            score += 5;
            improvements.Add(new ImprovementItem
            {
                Category = "Stock",
                Issue = "Low stock quantity",
                Suggestion = "Increase stock to 10+ units for better visibility",
                Impact = 5
            });
        }

        // Generate keyword suggestions based on title and category
        keywords = GenerateKeywords(request.Title, request.Category);

        // Price comparison (mock data)
        var priceAlert = new CompetitorPriceAlert
        {
            YourPrice = request.Price,
            AvgMarketPrice = request.Price * 1.15m,
            Recommendation = request.Price < (request.Price * 1.15m) 
                ? "Your price is competitive" 
                : "Consider lowering price to match market average"
        };

        // Best time to list (mock recommendation)
        var bestTime = new BestTimeToList
        {
            DayOfWeek = "Thursday",
            TimeRange = "10 AM - 2 PM",
            Reason = "Peak shopping hours with highest conversion rates"
        };

        var grade = score switch
        {
            >= 90 => "A+",
            >= 80 => "A",
            >= 70 => "B",
            >= 60 => "C",
            >= 50 => "D",
            _ => "F"
        };

        return new ListingCoachResponse
        {
            Score = score,
            Grade = grade,
            Improvements = improvements.OrderByDescending(i => i.Impact).ToList(),
            SuggestedKeywords = keywords,
            PriceAlert = priceAlert,
            BestTime = bestTime
        };
    }

    public async Task<bool> UpdateStatusAsync(Guid sellerId, string status)
    {
        var seller = await _sellers.GetByIdAsync(sellerId);
        if (seller == null) return false;

        seller.Status = Enum.Parse<SellerStatus>(status, true);
        await _sellers.UpdateAsync(seller);
        await _sellers.SaveChangesAsync();
        return true;
    }

    private static List<string> GenerateKeywords(string title, string category)
    {
        var keywords = new List<string>();
        
        // Extract words from title
        var words = title.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 3)
            .Take(5);
        
        keywords.AddRange(words);
        keywords.Add(category.ToLower());
        keywords.Add("best");
        keywords.Add("quality");
        keywords.Add("affordable");
        
        return keywords.Distinct().ToList();
    }

    private static SellerDto MapToDto(Seller s)
    {
        var kycStatus = "NotSubmitted";
        if (s.KycDocument != null)
        {
            var allVerified = s.KycDocument.AadhaarStatus == KycVerificationStatus.Verified &&
                            s.KycDocument.PanStatus == KycVerificationStatus.Verified &&
                            s.KycDocument.GstStatus == KycVerificationStatus.Verified;
            kycStatus = allVerified ? "Verified" : "Failed";
        }
        
        return new SellerDto
        {
            Id = s.Id,
            UserId = s.UserId,
            BusinessName = s.BusinessName,
            ContactEmail = s.Email,
            ContactPhone = s.PhoneNumber,
            Status = s.Status.ToString(),
            KycStatus = kycStatus,
            TotalEarnings = s.TotalEarnings,
            RegisteredAt = s.CreatedAt
        };
    }
}
