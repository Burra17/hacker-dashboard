using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Supplies the current-state <c>snapshot</c> for one channel. The hub sends every registered
/// provider's snapshot to a client when it connects, before deltas resume. New channels add a
/// provider rather than touching the hub — the seam for Phase 3 reconnect handling.
/// </summary>
public interface ISnapshotProvider
{
    /// <summary>The channel this provider builds a snapshot for.</summary>
    string Channel { get; }

    /// <summary>The current-state snapshot event, or <c>null</c> when there is nothing to send yet.</summary>
    IDashboardEvent? GetSnapshot();
}
