using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Retains the most recent system log lines so a newly connected client can be sent a snapshot
/// of current state before deltas resume. The producer appends; the snapshot is read on connect.
/// </summary>
public interface ISystemLogStore
{
    /// <summary>Records a newly produced log line, evicting the oldest beyond the retained window.</summary>
    void Add(SystemLogPayload entry);

    /// <summary>The retained recent lines, oldest first.</summary>
    IReadOnlyList<SystemLogPayload> GetRecent();
}
