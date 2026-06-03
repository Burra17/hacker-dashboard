using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Features.Sports.Common.Errors;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Infrastructure.Sports;

/// <summary>
/// Client for the followed teams' results and fixtures over API-Football (RapidAPI). Serves from a
/// time-boxed cache to stay under the upstream rate limit; on a fetch failure it falls back to the
/// last known value flagged stale, or <see cref="SportsErrors.Unavailable"/> when nothing has been
/// fetched yet. The RapidAPI auth headers and base URL are configured on the typed
/// <see cref="HttpClient"/> in DI from <see cref="SportsOptions"/>.
/// </summary>
public sealed class ApiFootballSportsClient(
    HttpClient httpClient,
    SportsCache cache,
    IOptions<SportsOptions> options) : ISportsProvider
{
    /// <summary>RapidAPI request headers (set on the typed client in DI).</summary>
    public const string RapidApiKeyHeader = "x-rapidapi-key";
    public const string RapidApiHostHeader = "x-rapidapi-host";

    private const string FixturesPath = "v3/fixtures";
    private const string LastSelector = "last";
    private const string NextSelector = "next";
    private const string NoResult = "Inga tidigare matcher";
    private const string Unknown = "—";

    private static readonly NextMatchDto NoNextMatch = new(Date: Unknown, Time: Unknown, Opponent: Unknown);

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

    private async Task<SportsDto> FetchFromSourceAsync(CancellationToken cancellationToken)
    {
        TeamSportsDto hammarby = await FetchTeamAsync(_options.HammarbyTeamId, cancellationToken);
        TeamSportsDto chelsea = await FetchTeamAsync(_options.ChelseaTeamId, cancellationToken);
        return new SportsDto(hammarby, chelsea, ObservedAt: DateTimeOffset.UtcNow, Stale: false);
    }

    private async Task<TeamSportsDto> FetchTeamAsync(int teamId, CancellationToken cancellationToken)
    {
        FixtureItem? last = await FetchFixtureAsync(teamId, LastSelector, cancellationToken);
        FixtureItem? next = await FetchFixtureAsync(teamId, NextSelector, cancellationToken);

        return new TeamSportsDto(
            Team: ResolveTeamName(teamId, last ?? next),
            LatestResult: FormatResult(last),
            NextMatch: FormatNextMatch(teamId, next));
    }

    // API-Football returns the most recent (last=1) or upcoming (next=1) fixture for a team.
    private async Task<FixtureItem?> FetchFixtureAsync(int teamId, string selector, CancellationToken cancellationToken)
    {
        string path = string.Create(
            CultureInfo.InvariantCulture,
            $"{FixturesPath}?team={teamId}&{selector}=1&timezone={Uri.EscapeDataString(_options.Timezone)}");

        using HttpResponseMessage response = await httpClient.GetAsync(path, cancellationToken);
        response.EnsureSuccessStatusCode();

        FixturesResponse? body = await response.Content.ReadFromJsonAsync<FixturesResponse>(cancellationToken);
        return body?.Response.Count > 0 ? body.Response[0] : null;
    }

    private static string FormatResult(FixtureItem? fixture) =>
        fixture is null
            ? NoResult
            : string.Create(
                CultureInfo.InvariantCulture,
                $"{fixture.Teams.Home.Name} {fixture.Goals.Home ?? 0} - {fixture.Goals.Away ?? 0} {fixture.Teams.Away.Name}");

    private static NextMatchDto FormatNextMatch(int teamId, FixtureItem? fixture)
    {
        if (fixture is null)
        {
            return NoNextMatch;
        }

        return new NextMatchDto(
            Date: fixture.Fixture.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Time: fixture.Fixture.Date.ToString("HH:mm", CultureInfo.InvariantCulture),
            Opponent: OpponentOf(teamId, fixture));
    }

    private static string ResolveTeamName(int teamId, FixtureItem? fixture) =>
        fixture is null
            ? Unknown
            : fixture.Teams.Home.Id == teamId ? fixture.Teams.Home.Name : fixture.Teams.Away.Name;

    private static string OpponentOf(int teamId, FixtureItem fixture) =>
        fixture.Teams.Home.Id == teamId ? fixture.Teams.Away.Name : fixture.Teams.Home.Name;

    private sealed record FixturesResponse(
        [property: JsonPropertyName("response")] IReadOnlyList<FixtureItem> Response);

    private sealed record FixtureItem(
        [property: JsonPropertyName("fixture")] FixtureInfo Fixture,
        [property: JsonPropertyName("teams")] FixtureTeams Teams,
        [property: JsonPropertyName("goals")] FixtureGoals Goals);

    private sealed record FixtureInfo(
        [property: JsonPropertyName("date")] DateTimeOffset Date);

    private sealed record FixtureTeams(
        [property: JsonPropertyName("home")] FixtureTeam Home,
        [property: JsonPropertyName("away")] FixtureTeam Away);

    private sealed record FixtureTeam(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("name")] string Name);

    private sealed record FixtureGoals(
        [property: JsonPropertyName("home")] int? Home,
        [property: JsonPropertyName("away")] int? Away);
}
