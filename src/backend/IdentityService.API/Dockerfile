FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["IdentityService.API/IdentityService.API.csproj", "IdentityService.API/"]
COPY ["IdentityService.Application/IdentityService.Application.csproj", "IdentityService.Application/"]
COPY ["IdentityService.Infrastructure/IdentityService.Infrastructure.csproj", "IdentityService.Infrastructure/"]
COPY ["IdentityService.Domain/IdentityService.Domain.csproj", "IdentityService.Domain/"]

RUN dotnet restore "IdentityService.API/IdentityService.API.csproj"

COPY . .
RUN dotnet build "IdentityService.API/IdentityService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IdentityService.API/IdentityService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5100
ENTRYPOINT ["dotnet", "IdentityService.API.dll"]
