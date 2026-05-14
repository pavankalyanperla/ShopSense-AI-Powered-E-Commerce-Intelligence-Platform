FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ReviewService.API/ReviewService.API.csproj", "ReviewService.API/"]
COPY ["ReviewService.Application/ReviewService.Application.csproj", "ReviewService.Application/"]
COPY ["ReviewService.Infrastructure/ReviewService.Infrastructure.csproj", "ReviewService.Infrastructure/"]
COPY ["ReviewService.Domain/ReviewService.Domain.csproj", "ReviewService.Domain/"]

RUN dotnet restore "ReviewService.API/ReviewService.API.csproj"

COPY . .
RUN dotnet build "ReviewService.API/ReviewService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ReviewService.API/ReviewService.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5400
ENTRYPOINT ["dotnet", "ReviewService.API.dll"]
