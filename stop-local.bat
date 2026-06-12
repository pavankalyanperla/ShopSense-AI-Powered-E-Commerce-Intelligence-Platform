@echo off
echo Stopping ShopSense...

echo Stopping Docker infrastructure...
docker-compose stop sqlserver redis rabbitmq

echo Killing .NET service processes...
for %%p in (5000 5100 5200 5300 5400 5500 5600) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo Killing ML service processes...
for %%p in (8001 8002 8003 8004 8005 8006) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo Killing Angular process...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

echo All services stopped!
pause
