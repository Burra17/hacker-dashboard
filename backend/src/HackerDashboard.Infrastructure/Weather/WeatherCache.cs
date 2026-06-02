using System.Diagnostics.CodeAnalysis;
using HackerDashboard.Application.Features.Weather.Common.Dtos;

namespace HackerDashboard.Infrastructure.Weather;

/// <summary>
/// Thread-safe holder for the last successfully fetched weather reading (singleton). Backs the
/// graceful-degradation fallback: when the upstream source is down the client returns this value
/// flagged stale instead of failing.
/// </summary>
public sealed class WeatherCache
{
    private readonly Lock _gate = new();
    private WeatherDto? _last;

    public void Store(WeatherDto reading)
    {
        lock (_gate)
        {
            _last = reading;
        }
    }

    public bool TryGetLast([NotNullWhen(true)] out WeatherDto? reading)
    {
        lock (_gate)
        {
            reading = _last;
            return reading is not null;
        }
    }
}
