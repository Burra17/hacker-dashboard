namespace HackerDashboard.Contracts;

/// <summary>Payload for the "system.logs" channel — one line in the rolling system log feed.</summary>
/// <param name="Source">Subsystem that emitted the line, e.g. "kernel", "auth", "net".</param>
public sealed record SystemLogPayload(
    SystemLogLevel Level,
    string Source,
    string Message);
