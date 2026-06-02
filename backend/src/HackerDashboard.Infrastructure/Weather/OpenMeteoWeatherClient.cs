using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ErrorOr;
using HackerDashboard.Application.Features.Weather.Common.Dtos;
using HackerDashboard.Application.Features.Weather.Common.Errors;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Infrastructure.Weather;

/// <summary>
/// Thin client over the keyless Open-Meteo API. Fetches the current temperature and sky condition
/// for the configured coordinates. On success it caches the reading; when the source is unreachable
/// it falls back to the last known value flagged stale, or <see cref="WeatherErrors.Unavailable"/>
/// when nothing has been fetched yet.
/// </summary>
public sealed class OpenMeteoWeatherClient(
    HttpClient httpClient,
    WeatherCache cache,
    IOptions<WeatherOptions> options) : IWeatherProvider
{
    private readonly WeatherOptions _options = options.Value;

    public async Task<ErrorOr<WeatherDto>> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using HttpResponseMessage response = await httpClient.GetAsync(BuildForecastPath(), cancellationToken);
            response.EnsureSuccessStatusCode();

            ForecastResponse? body =
                await response.Content.ReadFromJsonAsync<ForecastResponse>(cancellationToken);

            if (body?.Current is null)
            {
                return FallbackOrError();
            }

            var reading = new WeatherDto(
                Location: _options.LocationName,
                TemperatureCelsius: body.Current.Temperature,
                Condition: MapCondition(body.Current.WeatherCode),
                ObservedAt: DateTimeOffset.UtcNow,
                Stale: false);

            cache.Store(reading);
            return reading;
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException)
        {
            return FallbackOrError();
        }
    }

    private ErrorOr<WeatherDto> FallbackOrError() =>
        cache.TryGetLast(out WeatherDto? last)
            ? last with { Stale = true }
            : WeatherErrors.Unavailable;

    private string BuildForecastPath() => string.Create(
        CultureInfo.InvariantCulture,
        $"v1/forecast?latitude={_options.Latitude}&longitude={_options.Longitude}&current=temperature_2m,weather_code");

    // WMO weather interpretation codes returned by Open-Meteo's "weather_code" field.
    private static string MapCondition(int weatherCode) => weatherCode switch
    {
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Overcast",
        45 or 48 => "Fog",
        51 or 53 or 55 => "Drizzle",
        56 or 57 => "Freezing drizzle",
        61 or 63 or 65 => "Rain",
        66 or 67 => "Freezing rain",
        71 or 73 or 75 => "Snowfall",
        77 => "Snow grains",
        80 or 81 or 82 => "Rain showers",
        85 or 86 => "Snow showers",
        95 => "Thunderstorm",
        96 or 99 => "Thunderstorm with hail",
        _ => "Unknown",
    };

    private sealed record ForecastResponse(
        [property: JsonPropertyName("current")] CurrentWeather? Current);

    private sealed record CurrentWeather(
        [property: JsonPropertyName("temperature_2m")] double Temperature,
        [property: JsonPropertyName("weather_code")] int WeatherCode);
}
