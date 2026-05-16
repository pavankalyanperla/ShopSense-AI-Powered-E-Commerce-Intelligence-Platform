# Day 7 - Create all Seller and Admin Portal components
$ErrorActionPreference = "Stop"

Write-Host "Creating Day 7 Seller & Admin Portal Components..." -ForegroundColor Cyan

# Base paths
$sellerPath = "src\frontend\shopsense-frontend\src\app\features\seller"
$adminPath = "src\frontend\shopsense-frontend\src\app\features\admin"

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow
$dirs = @(
    "$sellerPath\products",
    "$sellerPath\orders",
    "$sellerPath\earnings",
    "$adminPath\layout",
    "$adminPath\dashboard",
    "$adminPath\kyc",
    "$adminPath\orders",
    "$adminPath\coupons"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    }
}

Write-Host "`nDay 7 directory structure created!" -ForegroundColor Green
Write-Host "Now manually create the component files using the specifications provided." -ForegroundColor Yellow
