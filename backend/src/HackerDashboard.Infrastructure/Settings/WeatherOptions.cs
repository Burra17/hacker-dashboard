namespace HackerDashboard.Infrastructure.Settings;

/// <summary>Strongly-typed settings for the external Open-Meteo weather API, bound from "Weather".</summary>
public sealed class WeatherOptions
{
    public const string SectionName = "Weather";

    /// <summary>Base URL of the Open-Meteo API (keyless).</summary>
    public string BaseUrl { get; init; } = "https://api.open-meteo.com";

    /// <summary>Latitude of the location to report weather for.</summary>
    public double Latitude { get; init; } = 61.7283;

    /// <summary>Longitude of the location to report weather for.</summary>
    public double Longitude { get; init; } = 17.1036;

    /// <summary>Human-readable name echoed back in the reading.</summary>
    public string LocationName { get; init; } = "Hudiksvall";
}
