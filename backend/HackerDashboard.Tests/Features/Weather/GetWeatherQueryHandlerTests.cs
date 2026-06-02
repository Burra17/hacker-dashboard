using ErrorOr;
using HackerDashboard.Application.Features.Weather.Common.Dtos;
using HackerDashboard.Application.Features.Weather.Common.Errors;
using HackerDashboard.Application.Features.Weather.Queries.GetWeather;
using HackerDashboard.Application.Interfaces.Services;
using NSubstitute;

namespace HackerDashboard.Tests.Features.Weather;

[TestFixture]
public sealed class GetWeatherQueryHandlerTests
{
    private IWeatherProvider _weatherProviderMock = null!;
    private GetWeatherQueryHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _weatherProviderMock = Substitute.For<IWeatherProvider>();
        _handler = new GetWeatherQueryHandler(_weatherProviderMock);
    }

    [Test]
    public async Task Handle_ProviderReturnsReading_PassesItThrough()
    {
        var reading = new WeatherDto("Stockholm", 15.3, "Overcast", DateTimeOffset.UtcNow, Stale: false);
        _weatherProviderMock.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns<ErrorOr<WeatherDto>>(reading);

        ErrorOr<WeatherDto> result = await _handler.Handle(new GetWeatherQuery(), CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value, Is.EqualTo(reading));
    }

    [Test]
    public async Task Handle_ProviderUnavailable_PropagatesError()
    {
        _weatherProviderMock.GetCurrentAsync(Arg.Any<CancellationToken>())
            .Returns<ErrorOr<WeatherDto>>(WeatherErrors.Unavailable);

        ErrorOr<WeatherDto> result = await _handler.Handle(new GetWeatherQuery(), CancellationToken.None);

        Assert.That(result.IsError, Is.True);
        Assert.That(result.FirstError, Is.EqualTo(WeatherErrors.Unavailable));
    }
}
