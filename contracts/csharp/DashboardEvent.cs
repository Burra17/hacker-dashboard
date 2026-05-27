namespace HackerDashboard.Contracts;

/// <summary>The single envelope for all server -> client data pushed over SignalR.</summary>
/// <param name="EventId">GUID — used for dedup and as a stable React key.</param>
/// <param name="Channel">Logical stream, e.g. "system.logs", "terminal.response".</param>
/// <param name="Timestamp">UTC; serializes to ISO 8601.</param>
public sealed record DashboardEvent<T>(
    string EventId,
    string Channel,
    DashboardEventType Type,
    DateTimeOffset Timestamp,
    T Payload);
