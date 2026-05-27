using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Infrastructure.Streaming;

/// <summary>
/// In-memory ring buffer of recent system log lines, shared (singleton) between the producer
/// that appends lines and the hub that reads a snapshot on connect. Exposes that state as the
/// <see cref="DashboardChannels.SystemLogs"/> snapshot through <see cref="ISnapshotProvider"/>.
/// </summary>
public sealed class SystemLogStore : ISystemLogStore, ISnapshotProvider
{
    private const int Capacity = 50;

    private readonly Queue<SystemLogPayload> _recent = new(Capacity);
    private readonly Lock _gate = new();

    public string Channel => DashboardChannels.SystemLogs;

    public void Add(SystemLogPayload entry)
    {
        lock (_gate)
        {
            if (_recent.Count == Capacity)
            {
                _recent.Dequeue();
            }

            _recent.Enqueue(entry);
        }
    }

    public IReadOnlyList<SystemLogPayload> GetRecent()
    {
        lock (_gate)
        {
            return _recent.ToArray();
        }
    }

    public IDashboardEvent? GetSnapshot()
    {
        IReadOnlyList<SystemLogPayload> recent = GetRecent();
        if (recent.Count == 0)
        {
            return null;
        }

        return new DashboardEvent<IReadOnlyList<SystemLogPayload>>(
            EventId: Guid.NewGuid().ToString(),
            Channel: Channel,
            Type: DashboardEventType.Snapshot,
            Timestamp: DateTimeOffset.UtcNow,
            Payload: recent);
    }
}
