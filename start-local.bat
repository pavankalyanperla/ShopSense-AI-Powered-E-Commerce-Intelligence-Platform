@echo off
echo ========================================
echo   ShopSense -- Full Local Startup
echo ========================================

echo [1/4] Starting infrastructure (Docker)...
docker-compose up -d sqlserver redis rabbitmq
timeout /t 15 /nobreak

echo [2/4] Starting .NET services...
start "Identity:5100"  cmd /k "cd /d %~dp0src\backend\IdentityService.API && dotnet run"
start "Product:5200"   cmd /k "cd /d %~dp0src\backend\ProductService.API && dotnet run"
start "Order:5300"     cmd /k "cd /d %~dp0src\backend\OrderService.API && dotnet run"
start "Review:5400"    cmd /k "cd /d %~dp0src\backend\ReviewService.API && dotnet run"
start "Seller:5500"    cmd /k "cd /d %~dp0src\backend\SellerService.API && dotnet run"
start "Gateway:5000"   cmd /k "cd /d %~dp0src\backend\ApiGateway && dotnet run"
timeout /t 20 /nobreak

echo [3/4] Starting ML services...
start "Fraud:8001"     cmd /k "cd /d %~dp0src\ml\FraudService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"
start "Recommend:8002" cmd /k "cd /d %~dp0src\ml\RecommendationService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8002"
start "Sentiment:8003" cmd /k "cd /d %~dp0src\ml\SentimentService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8003"
start "Forecast:8004"  cmd /k "cd /d %~dp0src\ml\ForecastingService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8004"
start "Churn:8005"     cmd /k "cd /d %~dp0src\ml\ChurnService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8005"
start "Pricing:8006"   cmd /k "cd /d %~dp0src\ml\PricingService && python -m uvicorn app.main:app --host 0.0.0.0 --port 8006"
timeout /t 5 /nobreak

echo [4/4] Starting Angular frontend...
start "Angular:4200"   cmd /k "cd /d %~dp0src\frontend\shopsense-frontend && npm start"

echo ========================================
echo   All 13 services starting!
echo   Wait 60 seconds then open:
echo   http://localhost:4200
echo ========================================
echo.
echo   Admin login:
echo   Email:    testverify@gmail.com
echo   Password: Admin@123
echo.
echo   Customer login:
echo   Email:    test@gmail.com
echo   Password: Test@1234
echo ========================================
pause
