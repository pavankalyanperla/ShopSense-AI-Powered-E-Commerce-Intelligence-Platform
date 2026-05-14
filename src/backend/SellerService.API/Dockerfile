FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["SellerService.API/SellerService.API.csproj", "SellerService.API/"]
COPY ["SellerService.Application/SellerService.Application.csproj", "SellerService.Application/"]
COPY ["SellerService.Infrastructure/SellerService.Infrastructure.csproj", "SellerService.Infrastructure/"]
COPY ["SellerService.Domain/SellerService.Domain.csproj", "SellerService.Domain/"]

RUN dotnet restore "SellerService.API/SellerService.API.csproj"

COPY . .
RUN dotnet build "SellerService.API/SellerService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SellerService.API/SellerService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5500
ENTRYPOINT ["dotnet", "SellerService.API.dll"]
