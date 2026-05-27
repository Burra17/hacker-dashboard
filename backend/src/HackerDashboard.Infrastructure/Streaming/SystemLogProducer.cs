using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using Microsoft.Extensions.Hosting;

namespace HackerDashboard.Infrastructure.Streaming;

/// <summary>
/// Phase 1 producer that pushes a simulated rolling system log onto the
/// <see cref="DashboardChannels.SystemLogs"/> channel every <see cref="Interval"/>. It exercises
/// the full streaming pipe (producer → publisher → hub → client) without any external data.
/// Each line is also recorded in <see cref="ISystemLogStore"/> so a connecting client gets a
/// snapshot of recent history before deltas resume.
/// </summary>
public sealed class SystemLogProducer(IDashboardEventPublisher publisher, ISystemLogStore store) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(1.5);

    private static readonly string[] Sources = ["kernel", "auth", "net", "scheduler", "fs"];

    private static readonly (SystemLogLevel Level, string Message)[] Lines =
    [
        (SystemLogLevel.Info, "Connection established from 10.0.0.42"),
        (SystemLogLevel.Info, "Heartbeat acknowledged by node-7"),
        (SystemLogLevel.Debug, "Cache warm: 1042 entries preloaded"),
        (SystemLogLevel.Warning, "Latency spike detected: 320ms"),
        (SystemLogLevel.Info, "Packet inspection complete: 0 anomalies"),
        (SystemLogLevel.Error, "Failed login for user 'root' from 192.168.1.13"),
        (SystemLogLevel.Info, "Snapshot persisted to cold storage"),
        (SystemLogLevel.Debug, "GC reclaimed 84MB in 12ms"),
    ];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            using PeriodicTimer timer = new(Interval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                SystemLogPayload line = BuildLine();
                store.Add(line);
                await publisher.PublishAsync(ToDelta(line), stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown — the host cancelled stoppingToken.
        }
    }

    private static SystemLogPayload BuildLine()
    {
        (SystemLogLevel level, string message) = Lines[Random.Shared.Next(Lines.Length)];
        string source = Sources[Random.Shared.Next(Sources.Length)];
        return new SystemLogPayload(level, source, message);
    }

    private static DashboardEvent<SystemLogPayload> ToDelta(SystemLogPayload line) =>
        new(
            EventId: Guid.NewGuid().ToString(),
            Channel: DashboardChannels.SystemLogs,
            Type: DashboardEventType.Delta,
            Timestamp: DateTimeOffset.UtcNow,
            Payload: line);
}
