namespace OrderService.Application.Interfaces;

public interface IMessagePublisher
{
    Task PublishAsync(string exchange, string routingKey, object message);
}
