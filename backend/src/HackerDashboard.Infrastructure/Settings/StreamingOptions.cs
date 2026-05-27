namespace HackerDashboard.Infrastructure.Settings;

/// <summary>Strongly-typed settings for the streaming producers, bound from the "Streaming" section.</summary>
public sealed class StreamingOptions
{
    public const string SectionName = "Streaming";

    /// <summary>Seconds between heartbeat events.</summary>
    public int HeartbeatSeconds { get; init; } = 5;
}
