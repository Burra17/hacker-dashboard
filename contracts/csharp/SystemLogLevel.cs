namespace HackerDashboard.Contracts;

/// <summary>
/// Severity of a system log line. Serializes to camelCase string wire values
/// ("debug", "info", "warning", "error") via JsonStringEnumConverter,
/// matching the TypeScript string-literal union.
/// </summary>
public enum SystemLogLevel
{
    Debug,
    Info,
    Warning,
    Error
}
