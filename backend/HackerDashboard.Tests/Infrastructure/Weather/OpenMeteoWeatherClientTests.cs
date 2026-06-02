using System.Net;
using System.Text;
using ErrorOr;
using HackerDashboard.Application.Features.Weather.Common.Dtos;
using HackerDashboard.Application.Features.Weather.Common.Errors;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Weather;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Tests.Infrastructure.Weather;

[TestFixture]
public sealed class OpenMeteoWeatherClientTests
{
    private sealed class StubHandler(Func<HttpRequestMessage, HttpResponseMessage> responder) : HttpMessageHandler
    {
        public Uri? RequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri;
            return Task.FromResult(responder(request));
        }
    }

    private static OpenMeteoWeatherClient CreateClient(HttpMessageHandler handler, WeatherCache cache)
    {
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.open-meteo.com") };
        IOptions<WeatherOptions> options = Options.Create(new WeatherOptions
        {
            Latitude = 59.33,
            Longitude = 18.06,
            LocationName = "Stockholm",
        });

        return new OpenMeteoWeatherClient(httpClient, cache, options);
    }

    private static HttpResponseMessage Json(HttpStatusCode status, string body) =>
        new(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    [Test]
    public async Task GetCurrentAsync_Success_ReturnsFreshReadingAndCaches()
    {
        var handler = new StubHandler(_ =>
            Json(HttpStatusCode.OK, "{\"current\":{\"temperature_2m\":15.3,\"weather_code\":3}}"));
        var cache = new WeatherCache();
        OpenMeteoWeatherClient client = CreateClient(handler, cache);

        ErrorOr<WeatherDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.TemperatureCelsius, Is.EqualTo(15.3).Within(0.001));
        Assert.That(result.Value.Condition, Is.EqualTo("Overcast"));
        Assert.That(result.Value.Location, Is.EqualTo("Stockholm"));
        Assert.That(result.Value.Stale, Is.False);
        Assert.That(handler.RequestUri!.AbsolutePath, Is.EqualTo("/v1/forecast"));
        Assert.That(cache.TryGetLast(out _), Is.True);
    }

    [Test]
    public async Task GetCurrentAsync_SourceDownWithCachedValue_ReturnsLastKnownAsStale()
    {
        var cache = new WeatherCache();
        cache.Store(new WeatherDto("Stockholm", 9.0, "Clear sky", DateTimeOffset.UtcNow, Stale: false));
        var handler = new StubHandler(_ => throw new HttpRequestException("source down"));
        OpenMeteoWeatherClient client = CreateClient(handler, cache);

        ErrorOr<WeatherDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Stale, Is.True);
        Assert.That(result.Value.TemperatureCelsius, Is.EqualTo(9.0).Within(0.001));
        Assert.That(result.Value.Condition, Is.EqualTo("Clear sky"));
    }

    [Test]
    public async Task GetCurrentAsync_SourceDownWithEmptyCache_ReturnsUnavailable()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException("source down"));
        OpenMeteoWeatherClient client = CreateClient(handler, new WeatherCache());

        ErrorOr<WeatherDto> result = await client.GetCurrentAsync(CancellationToken.None);

        Assert.That(result.IsError, Is.True);
        Assert.That(result.FirstError, Is.EqualTo(WeatherErrors.Unavailable));
    }
}
