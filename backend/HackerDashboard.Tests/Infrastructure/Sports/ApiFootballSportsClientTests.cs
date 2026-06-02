using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Sports;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Tests.Infrastructure.Sports;

[TestFixture]
public sealed class ApiFootballSportsClientTests
{
    private static ApiFootballSportsClient CreateClient(SportsCache cache, int cacheHours = 3)
    {
        IOptions<SportsOptions> options = Options.Create(new SportsOptions { CacheHours = cacheHours });
        return new ApiFootballSportsClient(cache, options);
    }

    [Test]
    public async Task GetCurrentAsync_EmptyCache_ReturnsReadingForBothTeamsAndCaches()
    {
        var cache = new SportsCache();
        ApiFootballSportsClient client = CreateClient(cache);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Hammarby.Team, Is.EqualTo("Hammarby"));
        Assert.That(result.Value.Hammarby.LatestResult, Is.EqualTo("Hammarby 2 - 0 AIK"));
        Assert.That(result.Value.Chelsea.Team, Is.EqualTo("Chelsea"));
        Assert.That(result.Value.Chelsea.NextMatch.Opponent, Is.EqualTo("Liverpool"));
        Assert.That(result.Value.Stale, Is.False);
        Assert.That(cache.TryGetLast(out _), Is.True);
    }

    [Test]
    public async Task GetCurrentAsync_FreshValueCached_ServesFromCacheWithoutRefetching()
    {
        var cache = new SportsCache();
        SportsDto cached = new(
            new TeamSportsDto("Hammarby", "CACHED RESULT", new NextMatchDto("2026-07-01", "19:00", "Malmö FF")),
            new TeamSportsDto("Chelsea", "CACHED RESULT", new NextMatchDto("2026-07-02", "20:45", "Tottenham")),
            DateTimeOffset.UtcNow,
            Stale: false);
        cache.Store(cached);
        ApiFootballSportsClient client = CreateClient(cache);

        ErrorOr<SportsDto> result = await client.GetCurrentAsync(CancellationToken.None);

        // Within the TTL the client returns the cached value, not a freshly built mock reading.
        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value, Is.EqualTo(cached));
    }
}
