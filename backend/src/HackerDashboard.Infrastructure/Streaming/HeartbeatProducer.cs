using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using HackerDashboard.Infrastructure.Settings;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Infrastructure.Streaming;

/// <summary>
/// Emits a <c>heartbeat</c> on the <see cref="DashboardChannels.Heartbeat"/> channel every
/// <see cref="StreamingOptions.HeartbeatSeconds"/> so clients can show live/offline status and
/// detect a dead connection.
/// </summary>
public sealed class HeartbeatProducer(
    IDashboardEventPublisher publisher,
    IOptions<StreamingOptions> options) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(options.Value.HeartbeatSeconds);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        long sequence = 0;
        try
        {
            using PeriodicTimer timer = new(_interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await publisher.PublishAsync(BuildEvent(++sequence), stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown — the host cancelled stoppingToken.
        }
    }

    private static DashboardEvent<HeartbeatPayload> BuildEvent(long sequence) =>
        new(
            EventId: Guid.NewGuid().ToString(),
            Channel: DashboardChannels.Heartbeat,
            Type: DashboardEventType.Heartbeat,
            Timestamp: DateTimeOffset.UtcNow,
            Payload: new HeartbeatPayload(sequence));
}
