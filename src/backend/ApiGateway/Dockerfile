FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ApiGateway/ApiGateway.csproj", "ApiGateway/"]
RUN dotnet restore "ApiGateway/ApiGateway.csproj"

COPY . .
RUN dotnet build "ApiGateway/ApiGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ApiGateway/ApiGateway.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "ApiGateway.dll"]
