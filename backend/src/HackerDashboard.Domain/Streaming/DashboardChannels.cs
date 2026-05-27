namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// The fixed set of logical streams clients subscribe to. Channels are static in V1, so
/// these constants are the single source of producer/consumer channel names.
/// </summary>
public static class DashboardChannels
{
    /// <summary>Rolling system log feed (simulated in Phase 1).</summary>
    public const string SystemLogs = "system.logs";

    /// <summary>Periodic liveness ping driving the client's live/offline indicator.</summary>
    public const string Heartbeat = "heartbeat";
}
