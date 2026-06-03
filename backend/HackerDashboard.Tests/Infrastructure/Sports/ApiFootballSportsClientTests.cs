using System.Net;
using System.Text;
using System.Text.Json;
using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Features.Sports.Common.Errors;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Sports;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Tests.Infrastructure.Sports;

[TestFixture]
public sealed class ApiFootballSportsClientTests
{
    private const int HammarbyId = 375;
    private const int ChelseaId = 49;

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

    private static ApiFootballSportsClient CreateClient(
        HttpMessageHandler handler,
        SportsCache cache,
        int cacheHours = 3)
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api-football-v1.p.rapidapi.com"),
        };
        IOptions<SportsOptions> options = Options.Create(new SportsOptions
        {
            CacheHours = cacheHours,
            HammarbyTeamId = HammarbyId,
            ChelseaTeamId = ChelseaId,
        });

        return new ApiFootballSportsClient(httpClient, cache, options);
    }

    private static HttpResponseMessage Json(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    private static string FixtureJson(
        string homeName,
        int homeId,
        string awayName,
        int awayId,
        int? homeGoals,
        int? awayGoals,
        string date) =>
        JsonSerializer.Serialize(new
        {
            response = new[]
            {
                new
                {
                    fixture = new { date },
                    teams = new
                    {
                        home = new { id = homeId, name = homeName },
                        away = new { id = awayId, name = awayName },
                    },
                    goals = new { home = homeGoals, away = awayGoals },
                },
            },
        });

    private static string EmptyResponse() => """{"response":[]}""";

    // Routes the four per-team last/next requests to fixture JSON based on the query string.
    private static HttpResponseMessage RouteReading(HttpRequestMessage request)
    {
        string query = request.RequestUri!.Query;
        bool isHammarby = query.Contains($"team={HammarbyId}", StringComparison.Ordinal);
        bool isLast = query.Contains("last=1", StringComparison.Ordinal);

        return (isHammarby, isLast) switch
        {
            (true, true) => Json(FixtureJson("Hammarby", HammarbyId, "AIK", 1, 2, 0, "2026-06-01T15:00:00+02:00")),
            (true, false) => Json(FixtureJson("Djurgården", 99, "Hammarby", HammarbyId, null, null, "2026-06-08T15:00:00+02:00")),
            (false, true) => Json(FixtureJson("Chelsea", ChelseaId, "Arsenal", 42, 3, 1, "2026-05-30T17:30:00+01:00")),
            (false, false) => Json(FixtureJson("Chelsea", ChelseaId, "Liverpool", 40, null, null, "2026-06-07T17:30:00+01:00")),
        };
    }

    [Test]
    public async Task GetCurrentAsync_EmptyCache_FetchesMapsBothTeamsAndCaches()
    {
        var handler = new StubHandler(RouteReading);
        var cache = new SportsCache();
        ApiFootballSportsClient client = CreateClient(handler, cache);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Hammarby.Team, Is.EqualTo("Hammarby"));
        Assert.That(result.Value.Hammarby.LatestResult, Is.EqualTo("Hammarby 2 - 0 AIK"));
        Assert.That(result.Value.Hammarby.NextMatch.Opponent, Is.EqualTo("Djurgården"));
        Assert.That(result.Value.Hammarby.NextMatch.Date, Is.EqualTo("2026-06-08"));
        Assert.That(result.Value.Hammarby.NextMatch.Time, Is.EqualTo("15:00"));
        Assert.That(result.Value.Chelsea.LatestResult, Is.EqualTo("Chelsea 3 - 1 Arsenal"));
        Assert.That(result.Value.Chelsea.NextMatch.Opponent, Is.EqualTo("Liverpool"));
        Assert.That(result.Value.Stale, Is.False);
        // last + next per team.
        Assert.That(handler.CallCount, Is.EqualTo(4));
        Assert.That(cache.TryGetLast(out _), Is.True);
    }

    [Test]
    public async Task GetCurrentAsync_Success_RequestsFixturesPathWithBothSelectors()
    {
        var handler = new StubHandler(RouteReading);
        ApiFootballSportsClient client = CreateClient(handler, new SportsCache());

        await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(handler.RequestedQueries, Has.Some.Contains("last=1"));
        Assert.That(handler.RequestedQueries, Has.Some.Contains("next=1"));
        Assert.That(handler.RequestedQueries, Has.All.Contains("timezone="));
    }

    [Test]
    public async Task GetCurrentAsync_MissingFixtures_DegradesToPlaceholders()
    {
        var handler = new StubHandler(_ => Json(EmptyResponse()));
        ApiFootballSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Hammarby.LatestResult, Is.EqualTo("Inga tidigare matcher"));
        Assert.That(result.Value.Hammarby.NextMatch.Opponent, Is.EqualTo("—"));
    }

    [Test]
    public async Task GetCurrentAsync_FreshValueCached_ServesFromCacheWithoutCallingApi()
    {
        var cache = new SportsCache();
        SportsDto cached = new(
            new TeamSportsDto("Hammarby", "CACHED RESULT", new NextMatchDto("2026-07-01", "19:00", "Malmö FF")),
            new TeamSportsDto("Chelsea", "CACHED RESULT", new NextMatchDto("2026-07-02", "20:45", "Tottenham")),
            DateTimeOffset.UtcNow,
            Stale: false);
        cache.Store(cached);
        // Throws (not an HttpRequestException/JsonException) so any real call fails the test loudly.
        var handler = new StubHandler(_ => throw new InvalidOperationException("should not be called"));
        ApiFootballSportsClient client = CreateClient(handler, cache);

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
            new TeamSportsDto("Hammarby", "Hammarby 1 - 1 IFK", new NextMatchDto("2026-07-01", "19:00", "Malmö FF")),
            new TeamSportsDto("Chelsea", "Chelsea 0 - 2 City", new NextMatchDto("2026-07-02", "20:45", "Tottenham")),
            DateTimeOffset.UtcNow,
            Stale: false));
        var handler = new StubHandler(_ => throw new HttpRequestException("source down"));
        // Force a re-fetch by giving the cache no freshness window.
        ApiFootballSportsClient client = CreateClient(handler, cache, cacheHours: 0);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.Hammarby.LatestResult, Is.EqualTo("Hammarby 1 - 1 IFK"));
    }

    [Test]
    public async Task GetCurrentAsync_SourceDownWithEmptyCache_ReturnsUnavailable()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException("source down"));
        ApiFootballSportsClient client = CreateClient(handler, new SportsCache());

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.True);
        Assert.That(result.FirstError, Is.EqualTo(SportsErrors.Unavailable));
    }
}
