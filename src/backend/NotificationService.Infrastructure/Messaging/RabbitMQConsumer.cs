using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Messages;

namespace NotificationService.Infrastructure.Messaging;

public class RabbitMQConsumer : BackgroundService
{
    private readonly IConfiguration _config;
    private readonly IServiceProvider _services;
    private readonly ILogger<RabbitMQConsumer> _logger;
    private IConnection? _connection;
    private IModel? _channel;

    public RabbitMQConsumer(
        IConfiguration config,
        IServiceProvider services,
        ILogger<RabbitMQConsumer> logger)
    {
        _config = config;
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(5000, stoppingToken);

        var connected = false;
        var retries = 0;

        while (!connected && retries < 5 && !stoppingToken.IsCancellationRequested)
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _config["RabbitMQ:Host"] ?? "localhost",
                    UserName = _config["RabbitMQ:Username"] ?? "guest",
                    Password = _config["RabbitMQ:Password"] ?? "guest",
                    RequestedHeartbeat = TimeSpan.FromSeconds(60),
                    AutomaticRecoveryEnabled = true,
                    DispatchConsumersAsync = true
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                SetupQueues();
                StartConsuming(stoppingToken);

                connected = true;
                _logger.LogInformation("NotificationService RabbitMQ consumer connected and listening");
            }
            catch (Exception ex)
            {
                retries++;
                _logger.LogWarning(ex, "RabbitMQ connection attempt {Retry}/5 failed. Retrying in 5s...", retries);
                await Task.Delay(5000, stoppingToken);
            }
        }

        if (!connected)
            _logger.LogError("NotificationService could not connect to RabbitMQ after 5 attempts. Running without messaging.");

        while (!stoppingToken.IsCancellationRequested)
            await Task.Delay(1000, stoppingToken);
    }

    private void SetupQueues()
    {
        if (_channel == null) return;

        var queues = new Dictionary<string, string>
        {
            ["order.placed"] = "notification.order.placed",
            ["order.status"] = "notification.order.status",
            ["fraud.check"] = "notification.fraud.check",
            ["kyc.decision"] = "notification.kyc.decision"
        };

        foreach (var (exchange, queue) in queues)
        {
            _channel.ExchangeDeclare(exchange, ExchangeType.Fanout, durable: true);
            _channel.QueueDeclare(queue, durable: true, exclusive: false, autoDelete: false);
            _channel.QueueBind(queue, exchange, "");
        }

        _channel.BasicQos(0, 1, false);
    }

    private void StartConsuming(CancellationToken stoppingToken)
    {
        if (_channel == null) return;

        ConsumeQueue("notification.order.placed", async body =>
        {
            var msg = Deserialize<OrderPlacedMessage>(body);
            if (msg != null)
                await ProcessAsync(svc => svc.SendOrderConfirmationAsync(msg));
        });

        ConsumeQueue("notification.order.status", async body =>
        {
            var msg = Deserialize<OrderStatusMessage>(body);
            if (msg != null)
                await ProcessAsync(svc => svc.SendOrderStatusUpdateAsync(msg));
        });

        ConsumeQueue("notification.fraud.check", async body =>
        {
            var msg = Deserialize<FraudCheckMessage>(body);
            if (msg != null)
                await ProcessAsync(svc => svc.SendFraudAlertAsync(msg));
        });

        ConsumeQueue("notification.kyc.decision", async body =>
        {
            var msg = Deserialize<KycDecisionMessage>(body);
            if (msg != null)
                await ProcessAsync(svc => msg.IsApproved
                    ? svc.SendKycApprovedAsync(msg)
                    : svc.SendKycRejectedAsync(msg));
        });
    }

    private void ConsumeQueue(string queueName, Func<string, Task> handler)
    {
        if (_channel == null) return;

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += async (_, ea) =>
        {
            var body = Encoding.UTF8.GetString(ea.Body.ToArray());
            try
            {
                await handler(body);
                _channel.BasicAck(ea.DeliveryTag, false);
                _logger.LogInformation("Processed message from queue: {Queue}", queueName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing message from {Queue}", queueName);
                _channel.BasicNack(ea.DeliveryTag, false, false);
            }
        };

        _channel.BasicConsume(queueName, false, consumer);
    }

    private async Task ProcessAsync(Func<INotificationService, Task> action)
    {
        using var scope = _services.CreateScope();
        var svc = scope.ServiceProvider.GetRequiredService<INotificationService>();
        await action(svc);
    }

    private static T? Deserialize<T>(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch { return default; }
    }

    public override void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        base.Dispose();
    }
}
