using ErrorOr;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Features.Sports.Common.Errors;
using HackerDashboard.Application.Features.Sports.Queries.GetSports;
using HackerDashboard.Application.Interfaces.Services;
using NSubstitute;

namespace HackerDashboard.Tests.Features.Sports;

[TestFixture]
public sealed class GetSportsQueryHandlerTests
{
    private ISportsProvider _sportsProviderMock = null!;
    private GetSportsQueryHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _sportsProviderMock = Substitute.For<ISportsProvider>();
        _handler = new GetSportsQueryHandler(_sportsProviderMock);
    }

    private static SportsDto SampleReading() =>
        new(
            new TeamSportsDto("Hammarby", ["Hammarby 2 - 0 AIK"], new NextMatchDto("2026-06-08", "15:00", "Djurgården")),
            new TeamSportsDto("Chelsea", ["Chelsea 3 - 1 Arsenal"], new NextMatchDto("2026-06-07", "17:30", "Liverpool")),
            DateTimeOffset.UtcNow,
            Stale: false);

    [Test]
    public async Task Handle_ProviderReturnsReading_PassesItThrough()
    {
        SportsDto reading = SampleReading();
        _sportsProviderMock.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns<ErrorOr<SportsDto>>(reading);

        ErrorOr<SportsDto> result = await _handler.Handle(new GetSportsQuery(), CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value, Is.EqualTo(reading));
    }

    [Test]
    public async Task Handle_ProviderUnavailable_PropagatesError()
    {
        _sportsProviderMock.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns<ErrorOr<SportsDto>>(SportsErrors.Unavailable);

        ErrorOr<SportsDto> result = await _handler.Handle(new GetSportsQuery(), CancellationToken.None);

        Assert.That(result.IsError, Is.True);
        Assert.That(result.FirstError, Is.EqualTo(SportsErrors.Unavailable));
    }
}
