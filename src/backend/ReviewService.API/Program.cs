using Serilog;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ReviewService.Infrastructure.Data;
using ReviewService.Infrastructure.Repositories;
using ReviewService.Infrastructure.Clients;
using ReviewService.Application.Services;
using ReviewService.Application.Interfaces;
using ReviewService.Domain.Interfaces;
using ReviewService.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ReviewDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()));

// Named HttpClient for SentimentService
builder.Services.AddHttpClient<ISentimentClient, SentimentClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:SentimentService"] ?? "http://localhost:8003");
    client.Timeout = TimeSpan.FromSeconds(5);
});

// Named HttpClient for ProductService
builder.Services.AddHttpClient<IProductClient, ProductClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Services:ProductService"] ?? "http://localhost:5200");
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService.Application.Services.ReviewService>();

builder.Services.AddHealthChecks()
    .AddDbContextCheck<ReviewDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ReviewDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
