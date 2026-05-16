using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using SellerService.Application.Interfaces;

namespace SellerService.Infrastructure.Messaging;

public class RabbitMQPublisher : IMessagePublisher, IDisposable
{
    private readonly IConnection? _connection;
    private readonly IModel? _channel;
    private readonly ILogger<RabbitMQPublisher> _logger;

    public RabbitMQPublisher(IConfiguration config, ILogger<RabbitMQPublisher> logger)
    {
        _logger = logger;
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = config["RabbitMQ:Host"] ?? "localhost",
                UserName = config["RabbitMQ:Username"] ?? "guest",
                Password = config["RabbitMQ:Password"] ?? "guest",
                AutomaticRecoveryEnabled = true
            };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.ExchangeDeclare("kyc.decision", ExchangeType.Fanout, durable: true);
            _logger.LogInformation("SellerService RabbitMQ publisher connected");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SellerService RabbitMQ not available. Events will be skipped.");
        }
    }

    public Task PublishAsync<T>(string exchange, string routingKey, T message)
    {
        if (_channel == null || !_channel.IsOpen)
        {
            _logger.LogWarning("RabbitMQ not available. Skipping publish to {Exchange}", exchange);
            return Task.CompletedTask;
        }

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
        var props = _channel.CreateBasicProperties();
        props.Persistent = true;
        props.ContentType = "application/json";

        _channel.BasicPublish(exchange, routingKey, props, body);
        _logger.LogInformation("Published event to {Exchange}", exchange);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        GC.SuppressFinalize(this);
    }
}
