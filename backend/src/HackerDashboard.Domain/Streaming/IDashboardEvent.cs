namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// Non-generic view of <see cref="DashboardEvent{T}"/> so heterogeneous events (different
/// payload types) can be held and dispatched together — e.g. the set of per-channel snapshots
/// the hub sends a newly connected client. The wire shape is unchanged: serializers see the
/// concrete <see cref="DashboardEvent{T}"/> public properties, not this interface.
/// </summary>
public interface IDashboardEvent
{
    string EventId { get; }
    string Channel { get; }
    DashboardEventType Type { get; }
    DateTimeOffset Timestamp { get; }
    object? Payload { get; }
}
