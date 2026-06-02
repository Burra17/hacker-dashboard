namespace HackerDashboard.Contracts;

/// <summary>
/// Current weather for the configured location, fetched on demand over HTTP (polled by the
/// frontend via TanStack Query — not streamed over SignalR).
/// </summary>
/// <param name="Location">Human-readable name of the location the reading is for.</param>
/// <param name="TemperatureCelsius">Current temperature in degrees Celsius.</param>
/// <param name="Condition">Human-readable sky condition, e.g. "Clear sky", "Overcast".</param>
/// <param name="ObservedAt">When the reading was produced (UTC).</param>
/// <param name="Stale">True when the upstream source was unavailable and this is the last known value.</param>
public sealed record WeatherPayload(
    string Location,
    double TemperatureCelsius,
    string Condition,
    DateTimeOffset ObservedAt,
    bool Stale);
