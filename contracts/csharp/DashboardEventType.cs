namespace HackerDashboard.Contracts;

/// <summary>
/// Lifecycle of an event on a channel. Serializes to camelCase wire values
/// ("snapshot", "delta", "heartbeat", "error") via JsonStringEnumConverter,
/// matching the TypeScript string-literal union.
/// </summary>
public enum DashboardEventType
{
    /// <summary>Full current state, sent first on (re)connect.</summary>
    Snapshot,

    /// <summary>Only what changed since the last event.</summary>
    Delta,

    /// <summary>Liveness ping; drives the live/offline indicator.</summary>
    Heartbeat,

    /// <summary>The producer failed to build a payload for this channel.</summary>
    Error
}
