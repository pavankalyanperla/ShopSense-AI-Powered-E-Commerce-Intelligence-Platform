using NotificationService.Application.Messages;

namespace NotificationService.Application.Services;

public static class EmailTemplateService
{
    private const string BrandBlue = "#1F4E79";
    private const string BrandLight = "#2E75B6";
    private const string Success = "#1E6B3E";
    private const string Danger = "#B91C1C";
    private const string Warning = "#B45309";

    private static string BaseLayout(string content, string headerColor = "#1F4E79") => $@"
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'/>
<meta name='viewport' content='width=device-width,initial-scale=1'/>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ font-family:'Segoe UI',Arial,sans-serif; background:#F1F5F9; color:#0F172A; }}
  .wrapper {{ max-width:600px; margin:0 auto; padding:24px 16px; }}
  .header {{ background:{headerColor}; border-radius:12px 12px 0 0; padding:28px 32px; text-align:center; }}
  .header-logo {{ display:inline-flex; align-items:center; gap:10px; text-decoration:none; }}
  .header-logo-icon {{ width:40px; height:40px; background:#fff; border-radius:8px; display:inline-flex;
    align-items:center; justify-content:center; font-weight:800; color:{headerColor}; font-size:1.2rem; }}
  .header-logo-text {{ font-size:1.4rem; font-weight:700; color:#fff; }}
  .body {{ background:#fff; padding:32px; border-radius:0 0 12px 12px;
    border:1px solid #E2E8F0; border-top:none; }}
  .greeting {{ font-size:1.1rem; font-weight:600; color:#0F172A; margin-bottom:8px; }}
  .message {{ color:#475569; line-height:1.6; margin-bottom:24px; font-size:.95rem; }}
  .btn {{ display:inline-block; padding:12px 28px; background:{headerColor}; color:#fff;
    text-decoration:none; border-radius:8px; font-weight:600; font-size:.95rem; margin:16px 0; }}
  .info-card {{ background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:16px 20px; margin:16px 0; }}
  .info-row {{ display:flex; justify-content:space-between; padding:6px 0;
    border-bottom:1px solid #F1F5F9; font-size:.875rem; }}
  .info-row:last-child {{ border-bottom:none; }}
  .info-label {{ color:#64748B; }}
  .info-value {{ font-weight:600; color:#0F172A; }}
  .product-row {{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #F1F5F9; }}
  .product-row:last-child {{ border-bottom:none; }}
  .product-name {{ font-size:.875rem; font-weight:500; color:#0F172A; }}
  .product-meta {{ font-size:.8rem; color:#64748B; }}
  .total-row {{ display:flex; justify-content:space-between; padding:12px 0;
    font-weight:700; font-size:1rem; border-top:2px solid #E2E8F0; margin-top:8px; }}
  .badge {{ display:inline-block; padding:4px 12px; border-radius:20px; font-size:.8rem; font-weight:600; }}
  .badge-success {{ background:#D1FAE5; color:#065F46; }}
  .badge-warning {{ background:#FEF3C7; color:#92400E; }}
  .badge-danger {{ background:#FEE2E2; color:#991B1B; }}
  .footer {{ text-align:center; padding:20px; color:#94A3B8; font-size:.8rem; line-height:1.6; }}
  .divider {{ height:1px; background:#E2E8F0; margin:20px 0; }}
  @media(max-width:600px) {{
    .body {{ padding:20px 16px; }}
    .info-row {{ flex-direction:column; gap:2px; }}
  }}
</style>
</head>
<body>
<div class='wrapper'>
  <div class='header'>
    <div class='header-logo'>
      <span class='header-logo-icon'>S</span>
      <span class='header-logo-text'>ShopSense</span>
    </div>
  </div>
  <div class='body'>
    {content}
  </div>
  <div class='footer'>
    <p>ShopSense — AI-Powered E-Commerce Intelligence Platform</p>
    <p>India's smartest way to shop and sell online</p>
    <p style='margin-top:8px;font-size:.75rem;color:#CBD5E1'>
      This is an automated email. Please do not reply.
    </p>
  </div>
</div>
</body>
</html>";

    public static string OrderConfirmation(OrderPlacedMessage msg)
    {
        var itemsHtml = string.Join("", msg.Items.Select(i => $@"
        <div class='product-row'>
          <div style='flex:1'>
            <p class='product-name'>{i.ProductName}</p>
            <p class='product-meta'>Qty: {i.Quantity} × ₹{i.UnitPrice:N0}</p>
          </div>
          <span style='font-weight:600'>₹{i.FinalPrice:N0}</span>
        </div>"));

        var content = $@"
      <p class='greeting'>Order Confirmed! 🎉</p>
      <p class='message'>
        Hi {msg.CustomerName}, your order has been placed successfully.
        We'll notify you when it ships.
      </p>

      <div class='info-card'>
        <div class='info-row'>
          <span class='info-label'>Order Number</span>
          <span class='info-value' style='color:{BrandBlue};font-size:1.1rem'>{msg.OrderNumber}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Order Date</span>
          <span class='info-value'>{msg.PlacedAt:dd MMM yyyy, hh:mm tt}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Payment Method</span>
          <span class='info-value'>{msg.PaymentMethod}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Delivery To</span>
          <span class='info-value'>{msg.DeliveryAddress.City}, {msg.DeliveryAddress.State} — {msg.DeliveryAddress.Pincode}</span>
        </div>
      </div>

      <p style='font-weight:600;margin:16px 0 8px;color:#0F172A'>Order Items</p>
      <div class='info-card'>
        {itemsHtml}
        <div class='total-row'>
          <span>Total Amount</span>
          <span style='color:{BrandBlue}'>₹{msg.TotalAmount:N0}</span>
        </div>
      </div>

      <div style='text-align:center'>
        <a href='http://localhost:4200/customer/orders' class='btn'>Track Your Order</a>
      </div>

      <div class='divider'></div>
      <p class='message' style='font-size:.85rem'>
        🛡️ Your payment is secured with our AI-powered fraud detection system.<br/>
        📦 Free delivery on orders above ₹499.<br/>
        🔄 Easy 7-day returns on all products.
      </p>";

        return BaseLayout(content);
    }

    public static string OrderStatusUpdate(OrderStatusMessage msg)
    {
        var (emoji, title, color, desc) = msg.NewStatus switch
        {
            "Confirmed" => ("✅", "Order Confirmed", Success,
                "Your order has been confirmed by the seller and is being prepared for shipment."),
            "Shipped" => ("🚚", "Order Shipped", BrandBlue,
                "Great news! Your order is on its way. You can track it using the button below."),
            "OutForDelivery" => ("📦", "Out for Delivery", Warning,
                "Your order is out for delivery today. Please ensure someone is available to receive it."),
            "Delivered" => ("🎉", "Order Delivered", Success,
                "Your order has been delivered successfully. We hope you love your purchase!"),
            "Cancelled" => ("❌", "Order Cancelled", Danger,
                "Your order has been cancelled. If you paid online, a refund will be processed within 3-5 business days."),
            _ => ("ℹ️", $"Order {msg.NewStatus}", BrandBlue, msg.Note ?? "Your order status has been updated.")
        };

        var noteRow = string.IsNullOrEmpty(msg.Note) ? "" :
            $"<div class='info-row'><span class='info-label'>Note</span><span class='info-value'>{msg.Note}</span></div>";

        var content = $@"
      <p class='greeting'>{emoji} {title}</p>
      <p class='message'>Hi {msg.CustomerName},<br/>{desc}</p>

      <div class='info-card'>
        <div class='info-row'>
          <span class='info-label'>Order Number</span>
          <span class='info-value' style='color:{BrandBlue}'>{msg.OrderNumber}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>New Status</span>
          <span class='info-value'><span class='badge badge-success'>{msg.NewStatus}</span></span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Updated At</span>
          <span class='info-value'>{msg.UpdatedAt:dd MMM yyyy, hh:mm tt}</span>
        </div>
        {noteRow}
      </div>

      <div style='text-align:center'>
        <a href='http://localhost:4200/customer/orders' class='btn'>View Order Details</a>
      </div>";

        return BaseLayout(content, color);
    }

    public static string KycApproved(KycDecisionMessage msg)
    {
        var content = $@"
      <p class='greeting'>🎉 Congratulations! Your KYC is Approved</p>
      <p class='message'>
        Hi {msg.BusinessName},<br/>
        Your KYC verification has been approved by the ShopSense admin team.
        You can now start listing products and selling to millions of Indian shoppers!
      </p>

      <div class='info-card'>
        <div class='info-row'>
          <span class='info-label'>Business Name</span>
          <span class='info-value'>{msg.BusinessName}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>KYC Status</span>
          <span class='info-value'><span class='badge badge-success'>✓ Approved</span></span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Approved On</span>
          <span class='info-value'>{msg.DecidedAt:dd MMM yyyy}</span>
        </div>
      </div>

      <p class='message'>
        <strong>What's next?</strong><br/>
        ✅ List your first product<br/>
        ✅ Use the AI Listing Coach to optimise visibility<br/>
        ✅ Start receiving orders from day one<br/>
        ✅ Get paid every Monday directly to your bank
      </p>

      <div style='text-align:center'>
        <a href='http://localhost:4200/seller/products' class='btn'>Start Listing Products</a>
      </div>";

        return BaseLayout(content, Success);
    }

    public static string KycRejected(KycDecisionMessage msg)
    {
        var content = $@"
      <p class='greeting'>⚠️ KYC Verification — Action Required</p>
      <p class='message'>
        Hi {msg.BusinessName},<br/>
        Unfortunately, your KYC application could not be approved at this time.
        Please review the reason below and resubmit your documents.
      </p>

      <div class='info-card' style='border-left:4px solid #EF4444'>
        <div class='info-row'>
          <span class='info-label'>Status</span>
          <span class='info-value'><span class='badge badge-danger'>Rejected</span></span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Reason</span>
          <span class='info-value'>{msg.Reason ?? "Documents did not meet requirements"}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Reviewed On</span>
          <span class='info-value'>{msg.DecidedAt:dd MMM yyyy}</span>
        </div>
      </div>

      <p class='message'>
        <strong>Common reasons for rejection:</strong><br/>
        • PAN number format is incorrect (should be ABCDE1234F)<br/>
        • Aadhaar number does not start with 2-9<br/>
        • GST number format is invalid<br/>
        • IFSC code does not match standard format
      </p>

      <div style='text-align:center'>
        <a href='http://localhost:4200/seller/kyc' class='btn' style='background:{Danger}'>
          Resubmit KYC Documents
        </a>
      </div>";

        return BaseLayout(content, Danger);
    }

    public static string FraudAlert(FraudCheckMessage msg, string adminEmail)
    {
        var content = $@"
      <p class='greeting'>🚨 Fraud Alert — Admin Action Required</p>
      <p class='message'>
        A high-risk transaction has been detected by the ShopSense AI fraud detection system.
        Please review immediately.
      </p>

      <div class='info-card' style='border-left:4px solid #EF4444'>
        <div class='info-row'>
          <span class='info-label'>Order ID</span>
          <span class='info-value'>{msg.OrderId}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Transaction Amount</span>
          <span class='info-value'>₹{msg.Amount:N0}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Payment Method</span>
          <span class='info-value'>{msg.PaymentMethod}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Customer Email</span>
          <span class='info-value'>{msg.CustomerEmail}</span>
        </div>
        <div class='info-row'>
          <span class='info-label'>Risk Level</span>
          <span class='info-value'><span class='badge badge-danger'>HIGH</span></span>
        </div>
      </div>

      <p class='message'>
        This order has been placed on <strong>Fraud Hold</strong> and will not be processed
        until you review and approve or block it from the admin panel.
      </p>

      <div style='text-align:center'>
        <a href='http://localhost:4200/admin/orders' class='btn' style='background:{Danger}'>
          Review in Admin Panel
        </a>
      </div>";

        return BaseLayout(content, Danger);
    }
}
