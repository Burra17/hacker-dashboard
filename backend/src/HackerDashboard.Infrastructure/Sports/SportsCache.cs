using System.Diagnostics.CodeAnalysis;
using HackerDashboard.Application.Features.Sports.Common.Dtos;

namespace HackerDashboard.Infrastructure.Sports;

/// <summary>
/// Thread-safe holder for the last fetched sports reading (singleton). Backs two behaviours:
/// a time-boxed "fresh" window so we re-fetch at most every few hours (rate-limit friendly), and
/// the graceful-degradation fallback — when the source is down the client returns the last value
/// flagged stale instead of failing.
/// </summary>
public sealed class SportsCache
{
    private readonly Lock _gate = new();
    private SportsDto? _last;
    private DateTimeOffset _storedAt;

    public void Store(SportsDto reading)
    {
        lock (_gate)
        {
            _last = reading;
            _storedAt = DateTimeOffset.UtcNow;
        }
    }

    /// <summary>Returns the cached reading only if it was stored less than <paramref name="ttl"/> ago.</summary>
    public bool TryGetFresh(TimeSpan ttl, [NotNullWhen(true)] out SportsDto? reading)
    {
        lock (_gate)
        {
            if (_last is not null && DateTimeOffset.UtcNow - _storedAt < ttl)
            {
                reading = _last;
                return true;
            }

            reading = null;
            return false;
        }
    }

    /// <summary>Returns the last cached reading regardless of age (used for the stale fallback).</summary>
    public bool TryGetLast([NotNullWhen(true)] out SportsDto? reading)
    {
        lock (_gate)
        {
            reading = _last;
            return reading is not null;
        }
    }
}
