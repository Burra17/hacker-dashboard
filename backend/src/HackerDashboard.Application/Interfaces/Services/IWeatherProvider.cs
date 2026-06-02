using ErrorOr;
using HackerDashboard.Application.Features.Weather.Common.Dtos;

namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Supplies the current weather for the configured location. The implementation owns the external
/// fetch plus graceful degradation: on a healthy source it returns a fresh reading and caches it;
/// when the source is unavailable it returns the last known value flagged <c>Stale</c>, or an error
/// if nothing has been fetched yet.
/// </summary>
public interface IWeatherProvider
{
    Task<ErrorOr<WeatherDto>> GetCurrentAsync(CancellationToken cancellationToken = default);
}
