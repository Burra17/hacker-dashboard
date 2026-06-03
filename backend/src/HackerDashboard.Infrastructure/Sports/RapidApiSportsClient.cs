using System.Globalization;
using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Settings;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace HackerDashboard.Infrastructure.Sports;

/// <summary>
/// Client for the followed teams' results and fixtures over the "Free API Live Football Data"
/// RapidAPI. Per team it searches matches by name and, classifying by kickoff time, derives the
/// most recent played result and the next upcoming fixture. Reads are served from a time-boxed
/// cache to stay under the rate limit.
/// </summary>
/// <remarks>
/// Degrades gracefully: the upstream failing for <em>any</em> reason (403/429, network, malformed
/// body) never surfaces as an error — it returns the last known value flagged stale, or a stale
/// "unavailable" placeholder when nothing has been fetched yet. So <c>GET /api/sports</c> always
/// answers 200 and the frontend just dims instead of flooding the console with errors.
/// </remarks>
public sealed class RapidApiSportsClient(
    HttpClient httpClient,
    SportsCache cache,
    IOptions<SportsOptions> options,
    TimeProvider timeProvider) : ISportsProvider
{
    /// <summary>RapidAPI request headers (set on the typed client in DI).</summary>
    public const string RapidApiKeyHeader = "x-rapidapi-key";
    public const string RapidApiHostHeader = "x-rapidapi-host";

    private const string MatchesSearchPath = "football-matches-search";
    private const string SuccessStatus = "success";
    private const string MatchType = "match";
    private const string UnavailableText = "Sport otillgängligt";
    private const string NoResultText = "Inga tidigare matcher";
    private const string Unknown = "—";

    private static readonly NextMatchDto NoNextMatch = new(Date: Unknown, Time: Unknown, Opponent: Unknown);

    private readonly SportsOptions _options = options.Value;
    private readonly TimeProvider _timeProvider = timeProvider;
    private readonly TimeZoneInfo _timeZone = ResolveTimeZone(options.Value.Timezone);

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
        // Any upstream failure (403/429, network, malformed JSON, timeout) degrades to a stale 200
        // rather than a 500. Genuine caller cancellation is the one thing allowed to propagate.
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            return Degraded();
        }
    }

    private SportsDto Degraded()
    {
        if (cache.TryGetLast(out SportsDto? last))
        {
            return last with { Stale = true };
        }

        return new SportsDto(
            Hammarby: Unavailable(_options.HammarbyTeamName),
            Chelsea: Unavailable(_options.ChelseaTeamName),
            ObservedAt: DateTimeOffset.UtcNow,
            Stale: true);
    }

    private static TeamSportsDto Unavailable(string team) => new(team, UnavailableText, NoNextMatch);

    private async Task<SportsDto> FetchFromSourceAsync(CancellationToken cancellationToken)
    {
        DateTimeOffset now = _timeProvider.GetUtcNow();
        IReadOnlyList<MatchSuggestion> hammarby = await SearchAsync(_options.HammarbyTeamName, cancellationToken);
        IReadOnlyList<MatchSuggestion> chelsea = await SearchAsync(_options.ChelseaTeamName, cancellationToken);

        return new SportsDto(
            Hammarby: BuildTeam(_options.HammarbyTeamId, _options.HammarbyTeamName, hammarby, now),
            Chelsea: BuildTeam(_options.ChelseaTeamId, _options.ChelseaTeamName, chelsea, now),
            ObservedAt: DateTimeOffset.UtcNow,
            Stale: false);
    }

    private async Task<IReadOnlyList<MatchSuggestion>> SearchAsync(string teamName, CancellationToken cancellationToken)
    {
        string path = $"{MatchesSearchPath}?search={Uri.EscapeDataString(teamName)}";

        using HttpResponseMessage response = await httpClient.GetAsync(path, cancellationToken);
        response.EnsureSuccessStatusCode();

        SearchResponse? body = await response.Content.ReadFromJsonAsync<SearchResponse>(cancellationToken);
        if (body is null
            || !string.Equals(body.Status, SuccessStatus, StringComparison.OrdinalIgnoreCase)
            || body.Response is null)
        {
            throw new HttpRequestException("Unexpected sports API response.");
        }

        return body.Response.Suggestions ?? [];
    }

    private TeamSportsDto BuildTeam(int teamId, string fallbackName, IReadOnlyList<MatchSuggestion> matches, DateTimeOffset now)
    {
        string id = teamId.ToString(CultureInfo.InvariantCulture);
        List<MatchSuggestion> teamMatches =
            [.. matches.Where(m => m.Type == MatchType && m.Involves(id))];

        // The free-tier "finished"/"started" flags are unreliable (played games come back as
        // not-finished), so classify by kickoff time instead: the most recent played match with a
        // score is the latest result; the earliest future match is the next fixture.
        MatchSuggestion? last = teamMatches
            .Where(m => m.Kickoff <= now && m.HasScore)
            .OrderByDescending(m => m.Kickoff)
            .FirstOrDefault();

        MatchSuggestion? next = teamMatches
            .Where(m => m.Kickoff > now)
            .OrderBy(m => m.Kickoff)
            .FirstOrDefault();

        return new TeamSportsDto(
            Team: ResolveTeamName(last ?? next, id, fallbackName),
            LatestResult: FormatResult(last),
            NextMatch: FormatNextMatch(next, id));
    }

    private static string FormatResult(MatchSuggestion? match) =>
        match is null
            ? NoResultText
            : string.Create(
                CultureInfo.InvariantCulture,
                $"{Name(match.HomeTeamName)} {match.HomeTeamScore ?? 0} - {match.AwayTeamScore ?? 0} {Name(match.AwayTeamName)}");

    private NextMatchDto FormatNextMatch(MatchSuggestion? match, string teamId)
    {
        if (match is null)
        {
            return NoNextMatch;
        }

        DateTimeOffset local = TimeZoneInfo.ConvertTime(match.Kickoff, _timeZone);
        return new NextMatchDto(
            Date: local.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Time: local.ToString("HH:mm", CultureInfo.InvariantCulture),
            Opponent: Name(match.IsHome(teamId) ? match.AwayTeamName : match.HomeTeamName));
    }

    private static string ResolveTeamName(MatchSuggestion? match, string teamId, string fallbackName)
    {
        if (match is null)
        {
            return fallbackName;
        }

        string? name = match.IsHome(teamId) ? match.HomeTeamName : match.AwayTeamName;
        return string.IsNullOrWhiteSpace(name) ? fallbackName : name;
    }

    private static string Name(string? name) => string.IsNullOrWhiteSpace(name) ? Unknown : name;

    private static TimeZoneInfo ResolveTimeZone(string id)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (Exception ex) when (ex is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }

    private sealed record SearchResponse(
        [property: JsonPropertyName("status")] string? Status,
        [property: JsonPropertyName("response")] SearchPayload? Response);

    private sealed record SearchPayload(
        [property: JsonPropertyName("suggestions")] IReadOnlyList<MatchSuggestion>? Suggestions);

    private sealed record MatchSuggestion(
        [property: JsonPropertyName("type")] string? Type,
        [property: JsonPropertyName("utcTime")] DateTimeOffset? UtcTime,
        [property: JsonPropertyName("matchDate")] DateTimeOffset? MatchDate,
        [property: JsonPropertyName("homeTeamId")] string? HomeTeamId,
        [property: JsonPropertyName("homeTeamName")] string? HomeTeamName,
        [property: JsonPropertyName("homeTeamScore")] int? HomeTeamScore,
        [property: JsonPropertyName("awayTeamId")] string? AwayTeamId,
        [property: JsonPropertyName("awayTeamName")] string? AwayTeamName,
        [property: JsonPropertyName("awayTeamScore")] int? AwayTeamScore)
    {
        public DateTimeOffset Kickoff => UtcTime ?? MatchDate ?? DateTimeOffset.MinValue;

        public bool HasScore => HomeTeamScore.HasValue && AwayTeamScore.HasValue;

        public bool Involves(string teamId) => HomeTeamId == teamId || AwayTeamId == teamId;

        public bool IsHome(string teamId) => HomeTeamId == teamId;
    }
}
