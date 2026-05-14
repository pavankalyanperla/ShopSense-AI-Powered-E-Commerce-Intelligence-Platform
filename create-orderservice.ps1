# Day 4 OrderService Complete Setup Script
Write-Host "Creating OrderService Application Layer..." -ForegroundColor Green

# Create Application directories
$appDirs = @(
    "src\backend\OrderService.Application\DTOs",
    "src\backend\OrderService.Application\Interfaces",
    "src\backend\OrderService.Application\Services"
)

foreach ($dir in $appDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create Infrastructure directories
$infraDirs = @(
    "src\backend\OrderService.Infrastructure\Data",
    "src\backend\OrderService.Infrastructure\Repositories",
    "src\backend\OrderService.Infrastructure\Messaging"
)

foreach ($dir in $infraDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create API directories
$apiDirs = @(
    "src\backend\OrderService.API\Controllers",
    "src\backend\OrderService.API\Middleware",
    "src\backend\OrderService.API\Properties"
)

foreach ($dir in $apiDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create Angular directories
$ngDirs = @(
    "src\frontend\shopsense-frontend\src\app\features\customer\cart",
    "src\frontend\shopsense-frontend\src\app\features\customer\checkout",
    "src\frontend\shopsense-frontend\src\app\shared\components\header"
)

foreach ($dir in $ngDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "✓ All directories created" -ForegroundColor Green
Write-Host "Now creating project files..." -ForegroundColor Cyan

# Create Application csproj
@"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\OrderService.Domain\OrderService.Domain.csproj" />
  </ItemGroup>
</Project>
"@ | Out-File -FilePath "src\backend\OrderService.Application\OrderService.Application.csproj" -Encoding UTF8

# Create Infrastructure csproj
@"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0" />
    <PackageReference Include="RabbitMQ.Client" Version="6.8.1" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\OrderService.Domain\OrderService.Domain.csproj" />
    <ProjectReference Include="..\OrderService.Application\OrderService.Application.csproj" />
  </ItemGroup>
</Project>
"@ | Out-File -FilePath "src\backend\OrderService.Infrastructure\OrderService.Infrastructure.csproj" -Encoding UTF8

# Create API csproj
@"
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.3" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\OrderService.Infrastructure\OrderService.Infrastructure.csproj" />
    <ProjectReference Include="..\OrderService.Application\OrderService.Application.csproj" />
  </ItemGroup>
</Project>
"@ | Out-File -FilePath "src\backend\OrderService.API\OrderService.API.csproj" -Encoding UTF8

Write-Host "✓ Project files created" -ForegroundColor Green
Write-Host "✓ OrderService structure ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Continue with Kiro to create all source files"
Write-Host "2. Add projects to solution"
Write-Host "3. Run EF Core migration"
Write-Host "4. Build and test"
