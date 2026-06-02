using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;

namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Supplies the latest result and next fixture for the followed teams. The implementation owns the
/// external fetch plus graceful degradation: it serves from a time-boxed cache to stay under the
/// upstream rate limit, and when the source is unavailable it returns the last known value flagged
/// <c>Stale</c>, or an error if nothing has been fetched yet.
/// </summary>
public interface ISportsProvider
{
    Task<ErrorOr<SportsDto>> GetCurrentAsync(CancellationToken cancellationToken = default);
}
