using System.Net;
using System.Text;
using System.Text.Json;
using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Sports;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Tests.Infrastructure.Sports;

[TestFixture]
public sealed class RapidApiSportsClientTests
{
    private const int HammarbyId = 8248;
    private const int ChelseaId = 8455;
    private const string HammarbyName = "Hammarby";
    private const string ChelseaName = "Chelsea";

    // "Now" for the date-based result/fixture classification; tests place matches around it.
    private static readonly DateTimeOffset Now = new(2026, 6, 3, 12, 0, 0, TimeSpan.Zero);

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class StubHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public int CallCount { get; private set; }
        public List<string> RequestedQueries { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            CallCount++;
            RequestedQueries.Add(request.RequestUri!.Query);
            return Task.FromResult(responder(request));
        }
    }

    private static RapidApiSportsClient CreateClient(
        HttpMessageHandler handler,
        SportsCache cache,
        int cacheHours = 3)
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://free-api-live-football-data.p.rapidapi.com"),
        };
        IOptions<SportsOptions> options = Options.Create(new SportsOptions
        {
            CacheHours = cacheHours,
            Timezone = "Europe/Stockholm",
            HammarbyTeamId = HammarbyId,
            HammarbyTeamName = HammarbyName,
            ChelseaTeamId = ChelseaId,
            ChelseaTeamName = ChelseaName,
        });

        return new RapidApiSportsClient(httpClient, cache, options, new FixedTimeProvider(Now));
    }

    private static HttpResponseMessage Json(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    // A played match carries scores; an unplayed one omits them. Past vs future is decided by utcTime.
    private static object Match(
        int homeId,
        string homeName,
        int awayId,
        string awayName,
        string utcTime,
        int? homeScore = null,
        int? awayScore = null) =>
        new
        {
            type = "match",
            utcTime,
            matchDate = utcTime,
            homeTeamId = homeId.ToString(),
            homeTeamName = homeName,
            homeTeamScore = homeScore,
            awayTeamId = awayId.ToString(),
            awayTeamName = awayName,
            awayTeamScore = awayScore,
        };

    private static string SearchJson(params object[] suggestions) =>
        JsonSerializer.Serialize(new { status = "success", response = new { suggestions } });

    // Routes each per-team search to that team's fixtures based on the ?search= term.
    private static HttpResponseMessage RouteReading(HttpRequestMessage request)
    {
        string query = request.RequestUri!.Query;

        if (query.Contains(HammarbyName, StringComparison.OrdinalIgnoreCase))
        {
            return Json(SearchJson(
                Match(HammarbyId, "Hammarby", 700, "AIK", "2026-05-20T16:00:00Z", 3, 0),
                Match(900, "Djurgården", HammarbyId, "Hammarby", "2026-06-08T13:00:00Z")));
        }

        return Json(SearchJson(
            Match(8472, "Sunderland", ChelseaId, "Chelsea", "2026-05-24T15:00:00Z", 2, 1),
            Match(323834, "Western Sydney Wanderers FC", ChelseaId, "Chelsea", "2026-07-28T10:00:00Z")));
    }

    [Test]
    public async Task GetCurrentAsync_EmptyCache_MapsRecentResultsAndNextMatchForBothTeams()
    {
        var handler = new StubHandler(RouteReading);
        var cache = new SportsCache();
        RapidApiSportsClient client = CreateClient(handler, cache);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Hammarby.Team, Is.EqualTo("Hammarby"));
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Hammarby 3 - 0 AIK" }));
        Assert.That(result.Value.Hammarby.NextMatch.Opponent, Is.EqualTo("Djurgården"));
        Assert.That(result.Value.Chelsea.RecentResults, Is.EqualTo(new[] { "Sunderland 2 - 1 Chelsea" }));
        Assert.That(result.Value.Chelsea.NextMatch.Opponent, Is.EqualTo("Western Sydney Wanderers FC"));
        Assert.That(result.Value.Stale, Is.False);
        Assert.That(handler.CallCount, Is.EqualTo(2)); // one search per team
        Assert.That(cache.TryGetLast(out _), Is.True);
    }

    [Test]
    public async Task GetCurrentAsync_ConvertsKickoffUtcToConfiguredTimezone()
    {
        var handler = new StubHandler(RouteReading);
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        // 13:00Z in summer → Europe/Stockholm (UTC+2) → 15:00.
        Assert.That(result.Value.Hammarby.NextMatch.Date, Is.EqualTo("2026-06-08"));
        Assert.That(result.Value.Hammarby.NextMatch.Time, Is.EqualTo("15:00"));
    }

    [Test]
    public async Task GetCurrentAsync_OrdersRecentResultsNewestFirst()
    {
        var handler = new StubHandler(_ => Json(SearchJson(
            Match(ChelseaId, "Chelsea", 100, "Arsenal", "2026-04-01T15:00:00Z", 1, 0),
            Match(200, "Liverpool", ChelseaId, "Chelsea", "2026-05-10T15:00:00Z", 0, 2))));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        // Newest (2026-05-10) first, then 2026-04-01.
        Assert.That(result.Value.Chelsea.RecentResults, Is.EqualTo(new[]
        {
            "Liverpool 0 - 2 Chelsea",
            "Chelsea 1 - 0 Arsenal",
        }));
    }

    [Test]
    public async Task GetCurrentAsync_CapsRecentResultsAtFiveNewestFirst()
    {
        var handler = new StubHandler(_ => Json(SearchJson(
            Match(ChelseaId, "Chelsea", 1, "Opp1", "2026-05-01T15:00:00Z", 1, 0),
            Match(ChelseaId, "Chelsea", 2, "Opp2", "2026-05-02T15:00:00Z", 2, 0),
            Match(ChelseaId, "Chelsea", 3, "Opp3", "2026-05-03T15:00:00Z", 3, 0),
            Match(ChelseaId, "Chelsea", 4, "Opp4", "2026-05-04T15:00:00Z", 4, 0),
            Match(ChelseaId, "Chelsea", 5, "Opp5", "2026-05-05T15:00:00Z", 5, 0),
            Match(ChelseaId, "Chelsea", 6, "Opp6", "2026-05-06T15:00:00Z", 6, 0))));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.Value.Chelsea.RecentResults, Has.Count.EqualTo(5));
        Assert.That(result.Value.Chelsea.RecentResults[0], Is.EqualTo("Chelsea 6 - 0 Opp6"));
        Assert.That(result.Value.Chelsea.RecentResults[4], Is.EqualTo("Chelsea 2 - 0 Opp2"));
    }

    [Test]
    public async Task GetCurrentAsync_PastUnfinishedFixtures_AreNotShownAsNextMatch()
    {
        // Reproduces the bug: matches whose dates are in the past must never surface as "next",
        // even though the free-tier feed may not flag them finished. Only played (scored) past
        // matches become results; with no future fixture, next degrades to a placeholder.
        var handler = new StubHandler(_ => Json(SearchJson(
            Match(ChelseaId, "Chelsea", 100, "Arsenal", "2026-01-10T15:00:00Z"),
            Match(200, "Liverpool", ChelseaId, "Chelsea", "2026-05-10T15:00:00Z", 0, 2))));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.Value.Chelsea.RecentResults, Is.EqualTo(new[] { "Liverpool 0 - 2 Chelsea" }));
        Assert.That(result.Value.Chelsea.NextMatch.Opponent, Is.EqualTo("—"));
    }

    [Test]
    public async Task GetCurrentAsync_Success_SearchesByTeamName()
    {
        var handler = new StubHandler(RouteReading);
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(handler.RequestedQueries, Has.Some.Contains("search=Hammarby"));
        Assert.That(handler.RequestedQueries, Has.Some.Contains("search=Chelsea"));
    }

    [Test]
    public async Task GetCurrentAsync_FreshValueCached_ServesFromCacheWithoutCallingApi()
    {
        var cache = new SportsCache();
        SportsDto cached = new(
            new TeamSportsDto("Hammarby", ["CACHED RESULT"], new NextMatchDto("2026-07-01", "19:00", "Malmö FF")),
            new TeamSportsDto("Chelsea", ["CACHED RESULT"], new NextMatchDto("2026-07-02", "20:45", "Tottenham")),
            DateTimeOffset.UtcNow,
            Stale: false);
        cache.Store(cached);
        var handler = new StubHandler(_ => throw new InvalidOperationException("should not be called"));
        RapidApiSportsClient client = CreateClient(handler, cache);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value, Is.EqualTo(cached));
        Assert.That(handler.CallCount, Is.EqualTo(0));
    }

    [Test]
    public async Task GetCurrentAsync_SourceDownWithCachedValue_ReturnsLastKnownAsStale()
    {
        var cache = new SportsCache();
        cache.Store(new SportsDto(
            new TeamSportsDto("Hammarby", ["Hammarby 1 - 1 IFK"], new NextMatchDto("2026-07-01", "19:00", "Malmö FF")),
            new TeamSportsDto("Chelsea", ["Chelsea 0 - 2 City"], new NextMatchDto("2026-07-02", "20:45", "Tottenham")),
            DateTimeOffset.UtcNow,
            Stale: false));
        var handler = new StubHandler(_ => throw new HttpRequestException("source down"));
        RapidApiSportsClient client = CreateClient(handler, cache, cacheHours: 0);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Hammarby 1 - 1 IFK" }));
    }

    [Test]
    public async Task GetCurrentAsync_Forbidden_EmptyCache_ReturnsStalePlaceholderNotError()
    {
        var handler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.Forbidden));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        // A 403 must degrade to a 200-friendly stale payload, never an error → never a 500.
        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.Hammarby.Team, Is.EqualTo("Hammarby"));
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Sport otillgängligt" }));
        Assert.That(result.Value.Chelsea.RecentResults, Is.EqualTo(new[] { "Sport otillgängligt" }));
    }

    [Test]
    public async Task GetCurrentAsync_RateLimited_EmptyCache_ReturnsStalePlaceholderNotError()
    {
        var handler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.TooManyRequests));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Sport otillgängligt" }));
    }

    [Test]
    public async Task GetCurrentAsync_NonSuccessStatusBody_DegradesGracefully()
    {
        var handler = new StubHandler(_ => Json("""{"status":"error","response":null}"""));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Sport otillgängligt" }));
    }

    [Test]
    public async Task GetCurrentAsync_NoFixturesForTeam_DegradesToPlaceholdersButNotStale()
    {
        var handler = new StubHandler(_ => Json(SearchJson()));
        RapidApiSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.False); // the API answered fine — there were just no matches
        Assert.That(result.Value.Hammarby.Team, Is.EqualTo("Hammarby"));
        Assert.That(result.Value.Hammarby.RecentResults, Is.EqualTo(new[] { "Inga tidigare matcher" }));
        Assert.That(result.Value.Hammarby.NextMatch.Opponent, Is.EqualTo("—"));
    }
}
