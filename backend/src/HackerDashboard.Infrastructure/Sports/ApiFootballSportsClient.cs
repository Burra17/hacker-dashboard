using System.Text.Json;
using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Features.Sports.Common.Errors;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Infrastructure.Sports;

/// <summary>
/// Client for the followed teams' results and fixtures. Serves from a time-boxed cache to stay under
/// the upstream rate limit; on a fetch failure it falls back to the last known value flagged stale,
/// or <see cref="SportsErrors.Unavailable"/> when nothing has been fetched yet.
/// </summary>
/// <remarks>
/// The network call is mocked for now so the UI can be built without a RapidAPI key — see
/// <see cref="FetchFromSourceAsync"/>. The graceful-degradation and caching wiring is real.
/// </remarks>
public sealed class ApiFootballSportsClient(
    SportsCache cache,
    IOptions<SportsOptions> options) : ISportsProvider
{
    private readonly SportsOptions _options = options.Value;

    public async Task<ErrorOr<SportsDto>> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        // Serve from the cache within its TTL window to avoid hammering the rate-limited API.
        if (cache.TryGetFresh(TimeSpan.FromHours(_options.CacheHours), out SportsDto? fresh))
        {
            return fresh;
        }

        try
        {
            SportsDto reading = await FetchFromSourceAsync(cancellationToken);
            cache.Store(reading);
            return reading;
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException)
        {
            return FallbackOrError();
        }
    }

    private ErrorOr<SportsDto> FallbackOrError() =>
        cache.TryGetLast(out SportsDto? last)
            ? last with { Stale = true }
            : SportsErrors.Unavailable;

    // TODO(#45): replace the mock with a real API-Football (RapidAPI) call once a key is provisioned.
    // The real request sets the "x-rapidapi-key" (_options.ApiKey) and "x-rapidapi-host"
    // (_options.ApiHost) headers against _options.BaseUrl, fetches the last + next fixture per team
    // (_options.HammarbyTeamId / _options.ChelseaTeamId), and maps the response into the DTO below.
    private Task<SportsDto> FetchFromSourceAsync(CancellationToken cancellationToken) =>
        Task.FromResult(BuildMockReading());

    private static SportsDto BuildMockReading() =>
        new(
            Hammarby: new TeamSportsDto(
                Team: "Hammarby",
                LatestResult: "Hammarby 2 - 0 AIK",
                NextMatch: new NextMatchDto(Date: "2026-06-08", Time: "15:00", Opponent: "Djurgården")),
            Chelsea: new TeamSportsDto(
                Team: "Chelsea",
                LatestResult: "Chelsea 3 - 1 Arsenal",
                NextMatch: new NextMatchDto(Date: "2026-06-07", Time: "17:30", Opponent: "Liverpool")),
            ObservedAt: DateTimeOffset.UtcNow,
            Stale: false);
}
