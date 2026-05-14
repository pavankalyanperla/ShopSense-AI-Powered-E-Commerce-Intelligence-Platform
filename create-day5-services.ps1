# Day 5 - Create ReviewService and SellerService files
$ErrorActionPreference = "Stop"

Write-Host "Creating Day 5 Services..." -ForegroundColor Green

# Add project references for ReviewService
Write-Host "Adding ReviewService project references..." -ForegroundColor Yellow
cd src/backend/ReviewService.Application
dotnet add reference ../ReviewService.Domain/ReviewService.Domain.csproj
cd ../ReviewService.Infrastructure
dotnet add reference ../ReviewService.Domain/ReviewService.Domain.csproj
dotnet add reference ../ReviewService.Application/ReviewService.Application.csproj
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
cd ../ReviewService.API
dotnet add reference ../ReviewService.Application/ReviewService.Application.csproj
dotnet add reference ../ReviewService.Infrastructure/ReviewService.Infrastructure.csproj
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Serilog.AspNetCore
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Add project references for SellerService
Write-Host "Adding SellerService project references..." -ForegroundColor Yellow
cd ../SellerService.Application
dotnet add reference ../SellerService.Domain/SellerService.Domain.csproj
cd ../SellerService.Infrastructure
dotnet add reference ../SellerService.Domain/SellerService.Domain.csproj
dotnet add reference ../SellerService.Application/SellerService.Application.csproj
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
cd ../SellerService.API
dotnet add reference ../SellerService.Application/SellerService.Application.csproj
dotnet add reference ../SellerService.Infrastructure/SellerService.Infrastructure.csproj
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Serilog.AspNetCore
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

cd ../../..

Write-Host "Project references added successfully!" -ForegroundColor Green
Write-Host "Now creating migrations..." -ForegroundColor Yellow

# Create migrations
cd src/backend
dotnet ef migrations add InitialCreate --project ReviewService.Infrastructure/ReviewService.Infrastructure.csproj --startup-project ReviewService.API/ReviewService.API.csproj --context ReviewDbContext
dotnet ef migrations add InitialCreate --project SellerService.Infrastructure/SellerService.Infrastructure.csproj --startup-project SellerService.API/SellerService.API.csproj --context SellerDbContext

cd ../..

Write-Host "Day 5 setup complete!" -ForegroundColor Green
