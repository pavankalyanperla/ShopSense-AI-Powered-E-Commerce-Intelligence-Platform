using OrderService.Application.Interfaces;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace OrderService.Infrastructure.Messaging;

public class RabbitMQPublisher : IMessagePublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMQPublisher(IConfiguration configuration)
    {
        var factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:Host"] ?? "localhost",
            Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
            UserName = configuration["RabbitMQ:Username"] ?? "guest",
            Password = configuration["RabbitMQ:Password"] ?? "guest"
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Declare exchanges
        _channel.ExchangeDeclare("order.placed", ExchangeType.Fanout, durable: true);
        _channel.ExchangeDeclare("order.status", ExchangeType.Fanout, durable: true);
        _channel.ExchangeDeclare("fraud.check", ExchangeType.Fanout, durable: true);
    }

    public Task PublishAsync(string exchange, string routingKey, object message)
    {
        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = _channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.ContentType = "application/json";

        _channel.BasicPublish(
            exchange: exchange,
            routingKey: routingKey,
            basicProperties: properties,
            body: body
        );

        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Close();
        _channel?.Dispose();
        _connection?.Close();
        _connection?.Dispose();
    }
}
