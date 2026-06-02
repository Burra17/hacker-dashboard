namespace HackerDashboard.Application.Features.Weather.Common.Dtos;

/// <summary>
/// Current weather response shape. Mirrors the <c>WeatherPayload</c> contract in <c>contracts/</c>.
/// </summary>
/// <param name="Location">Human-readable name of the location the reading is for.</param>
/// <param name="TemperatureCelsius">Current temperature in degrees Celsius.</param>
/// <param name="Condition">Human-readable sky condition, e.g. "Clear sky", "Overcast".</param>
/// <param name="ObservedAt">When the reading was produced (UTC).</param>
/// <param name="Stale">True when the source was unavailable and this is the last known value.</param>
public sealed record WeatherDto(
    string Location,
    double TemperatureCelsius,
    string Condition,
    DateTimeOffset ObservedAt,
    bool Stale);
