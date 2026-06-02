using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Infrastructure.Sports;

namespace HackerDashboard.Tests.Infrastructure.Sports;

[TestFixture]
public sealed class SportsCacheTests
{
    private static SportsDto Reading(bool stale = false) =>
        new(
            new TeamSportsDto("Hammarby", "Hammarby 2 - 0 AIK", new NextMatchDto("2026-06-08", "15:00", "Djurgården")),
            new TeamSportsDto("Chelsea", "Chelsea 3 - 1 Arsenal", new NextMatchDto("2026-06-07", "17:30", "Liverpool")),
            DateTimeOffset.UtcNow,
            Stale: stale);

    [Test]
    public void TryGetFresh_WithinTtl_ReturnsStoredReading()
    {
        var cache = new SportsCache();
        SportsDto stored = Reading();
        cache.Store(stored);

        bool found = cache.TryGetFresh(TimeSpan.FromHours(3), out SportsDto? reading);

        Assert.That(found, Is.True);
        Assert.That(reading, Is.EqualTo(stored));
    }

    [Test]
    public void TryGetFresh_TtlElapsed_ReturnsFalse()
    {
        var cache = new SportsCache();
        cache.Store(Reading());

        // A zero TTL means anything already stored is older than the window.
        bool found = cache.TryGetFresh(TimeSpan.Zero, out SportsDto? reading);

        Assert.That(found, Is.False);
        Assert.That(reading, Is.Null);
    }

    [Test]
    public void TryGetLast_AfterTtlElapsed_StillReturnsReading()
    {
        var cache = new SportsCache();
        SportsDto stored = Reading();
        cache.Store(stored);

        bool found = cache.TryGetLast(out SportsDto? reading);

        Assert.That(found, Is.True);
        Assert.That(reading, Is.EqualTo(stored));
    }

    [Test]
    public void TryGetLast_EmptyCache_ReturnsFalse()
    {
        var cache = new SportsCache();

        bool found = cache.TryGetLast(out SportsDto? reading);

        Assert.That(found, Is.False);
        Assert.That(reading, Is.Null);
    }
}
