FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["NotificationService.API/NotificationService.API.csproj", "NotificationService.API/"]
COPY ["NotificationService.Application/NotificationService.Application.csproj", "NotificationService.Application/"]
COPY ["NotificationService.Infrastructure/NotificationService.Infrastructure.csproj", "NotificationService.Infrastructure/"]
COPY ["NotificationService.Domain/NotificationService.Domain.csproj", "NotificationService.Domain/"]

RUN dotnet restore "NotificationService.API/NotificationService.API.csproj"

COPY . .
RUN dotnet build "NotificationService.API/NotificationService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NotificationService.API/NotificationService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5600
ENTRYPOINT ["dotnet", "NotificationService.API.dll"]
