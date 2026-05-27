namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// Payload for the <see cref="DashboardChannels.SystemLogs"/> channel — one line in the
/// rolling system log feed. Mirrors the shared contract in <c>contracts/</c>.
/// </summary>
/// <param name="Source">Subsystem that emitted the line, e.g. "kernel", "auth", "net".</param>
public sealed record SystemLogPayload(
    SystemLogLevel Level,
    string Source,
    string Message);
