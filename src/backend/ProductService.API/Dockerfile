FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ProductService.API/ProductService.API.csproj", "ProductService.API/"]
COPY ["ProductService.Application/ProductService.Application.csproj", "ProductService.Application/"]
COPY ["ProductService.Infrastructure/ProductService.Infrastructure.csproj", "ProductService.Infrastructure/"]
COPY ["ProductService.Domain/ProductService.Domain.csproj", "ProductService.Domain/"]

RUN dotnet restore "ProductService.API/ProductService.API.csproj"

COPY . .
RUN dotnet build "ProductService.API/ProductService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProductService.API/ProductService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5200
ENTRYPOINT ["dotnet", "ProductService.API.dll"]
