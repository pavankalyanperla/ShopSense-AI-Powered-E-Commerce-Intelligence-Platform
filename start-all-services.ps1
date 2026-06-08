# ============================================================
#  ShopSense — Start All Services
#  Usage:
#    .\start-all-services.ps1              # everything
#    .\start-all-services.ps1 -NoML        # skip ML services
#    .\start-all-services.ps1 -NoFrontend  # skip Angular
#    .\start-all-services.ps1 -NoDotNet    # skip .NET services
# ============================================================
param(
    [switch]$NoML,
    [switch]$NoFrontend,
    [switch]$NoDotNet
)

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Banner ──────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  ███████╗██╗  ██╗ ██████╗ ██████╗ ███████╗███████╗███╗   ██╗███████╗███████╗" -ForegroundColor Cyan
Write-Host "  ██╔════╝██║  ██║██╔═══██╗██╔══██╗██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝" -ForegroundColor Cyan
Write-Host "  ███████╗███████║██║   ██║██████╔╝███████╗█████╗  ██╔██╗ ██║███████╗█████╗  " -ForegroundColor Cyan
Write-Host "  ╚════██║██╔══██║██║   ██║██╔═══╝ ╚════██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝  " -ForegroundColor Cyan
Write-Host "  ███████║██║  ██║╚██████╔╝██║     ███████║███████╗██║ ╚████║███████║███████╗" -ForegroundColor Cyan
Write-Host "  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  AI-Powered E-Commerce Platform" -ForegroundColor White
Write-Host ""

# ── Helper: open a titled PowerShell window ─────────────────
function Open-Window {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Cmd
    )
    $fullDir = Join-Path $ROOT $WorkDir
    $script  = "`$Host.UI.RawUI.WindowTitle = '$Title'; Set-Location '$fullDir'; $Cmd"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $script
    Start-Sleep -Milliseconds 300
}

# ── Helper: find Python venv activate script ────────────────
function Get-VenvActivate {
    param([string]$ServiceDir)
    $candidates = @(
        (Join-Path $ROOT "$ServiceDir\venv\Scripts\Activate.ps1"),
        (Join-Path $ROOT "$ServiceDir\.venv\Scripts\Activate.ps1")
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return ". '$c'; " }
    }
    return ""  # no venv found — use global python
}

# ────────────────────────────────────────────────────────────
#  1. .NET Backend Services
# ────────────────────────────────────────────────────────────
if (-not $NoDotNet) {
    Write-Host "  Starting .NET services..." -ForegroundColor Yellow
    Write-Host ""

    $dotnetServices = @(
        @{ Title = "ShopSense | ApiGateway         :5000"; Dir = "src\backend\ApiGateway" },
        @{ Title = "ShopSense | IdentityService    :5100"; Dir = "src\backend\IdentityService.API" },
        @{ Title = "ShopSense | ProductService     :5200"; Dir = "src\backend\ProductService.API" },
        @{ Title = "ShopSense | OrderService       :5300"; Dir = "src\backend\OrderService.API" },
        @{ Title = "ShopSense | ReviewService      :5400"; Dir = "src\backend\ReviewService.API" },
        @{ Title = "ShopSense | SellerService      :5500"; Dir = "src\backend\SellerService.API" },
        @{ Title = "ShopSense | NotificationService:5063"; Dir = "src\backend\NotificationService.API" }
    )

    foreach ($svc in $dotnetServices) {
        Write-Host "    [.NET]  $($svc.Title.Split('|')[1].Trim())" -ForegroundColor Green
        Open-Window -Title $svc.Title -WorkDir $svc.Dir -Cmd "dotnet run"
    }

    Write-Host ""
}

# ────────────────────────────────────────────────────────────
#  2. Python ML Services
# ────────────────────────────────────────────────────────────
if (-not $NoML) {
    Write-Host "  Starting ML services..." -ForegroundColor Yellow
    Write-Host ""

    $mlServices = @(
        @{ Title = "ShopSense | FraudService          :8001"; Dir = "src\ml\FraudService";          Module = "app.main:app"; Port = 8001 },
        @{ Title = "ShopSense | RecommendationService :8002"; Dir = "src\ml\RecommendationService"; Module = "app.main:app"; Port = 8002 },
        @{ Title = "ShopSense | SentimentService      :8003"; Dir = "src\ml\SentimentService";      Module = "app.main:app"; Port = 8003 },
        @{ Title = "ShopSense | ForecastingService    :8004"; Dir = "src\ml\ForecastingService";    Module = "app.main:app"; Port = 8004 },
        @{ Title = "ShopSense | ChurnService          :8005"; Dir = "src\ml\ChurnService";          Module = "app.main:app"; Port = 8005 },
        @{ Title = "ShopSense | PricingService        :8006"; Dir = "src\ml\PricingService";        Module = "app.main:app"; Port = 8006 }
    )

    foreach ($svc in $mlServices) {
        $activate = Get-VenvActivate -ServiceDir $svc.Dir
        $cmd = "${activate}uvicorn $($svc.Module) --host 0.0.0.0 --port $($svc.Port) --reload"
        Write-Host "    [ML]    $($svc.Title.Split('|')[1].Trim())" -ForegroundColor Magenta
        Open-Window -Title $svc.Title -WorkDir $svc.Dir -Cmd $cmd
    }

    Write-Host ""
}

# ────────────────────────────────────────────────────────────
#  3. Angular Frontend
# ────────────────────────────────────────────────────────────
if (-not $NoFrontend) {
    Write-Host "  Starting Angular frontend..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    [Web]   Angular Frontend              :4200" -ForegroundColor Cyan
    Open-Window -Title "ShopSense | Angular Frontend       :4200" `
                -WorkDir "src\frontend\shopsense-frontend" `
                -Cmd "ng serve --open"
    Write-Host ""
}

# ────────────────────────────────────────────────────────────
#  Summary
# ────────────────────────────────────────────────────────────
Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  All windows launched. Service URLs:" -ForegroundColor White
Write-Host ""
if (-not $NoDotNet) {
    Write-Host "    ApiGateway          http://localhost:5000" -ForegroundColor DarkCyan
    Write-Host "    IdentityService     http://localhost:5100" -ForegroundColor DarkCyan
    Write-Host "    ProductService      http://localhost:5200" -ForegroundColor DarkCyan
    Write-Host "    OrderService        http://localhost:5300" -ForegroundColor DarkCyan
    Write-Host "    ReviewService       http://localhost:5400" -ForegroundColor DarkCyan
    Write-Host "    SellerService       http://localhost:5500" -ForegroundColor DarkCyan
    Write-Host "    NotificationService http://localhost:5063" -ForegroundColor DarkCyan
    Write-Host ""
}
if (-not $NoML) {
    Write-Host "    FraudService        http://localhost:8001/docs" -ForegroundColor DarkMagenta
    Write-Host "    RecommendService    http://localhost:8002/docs" -ForegroundColor DarkMagenta
    Write-Host "    SentimentService    http://localhost:8003/docs" -ForegroundColor DarkMagenta
    Write-Host "    ForecastingService  http://localhost:8004/docs" -ForegroundColor DarkMagenta
    Write-Host "    ChurnService        http://localhost:8005/docs" -ForegroundColor DarkMagenta
    Write-Host "    PricingService      http://localhost:8006/docs" -ForegroundColor DarkMagenta
    Write-Host ""
}
if (-not $NoFrontend) {
    Write-Host "    Angular             http://localhost:4200" -ForegroundColor Cyan
    Write-Host ""
}
Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Tip: close individual windows to stop a service." -ForegroundColor DarkGray
Write-Host "  Tip: .\start-all-services.ps1 -NoML  (skip ML)" -ForegroundColor DarkGray
Write-Host ""
