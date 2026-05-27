namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// Severity of a system log line. Serialized to camelCase wire values
/// ("debug", "info", "warning", "error") at the API boundary, matching the
/// shared TypeScript contract in <c>contracts/</c>.
/// </summary>
public enum SystemLogLevel
{
    Debug,
    Info,
    Warning,
    Error
}
