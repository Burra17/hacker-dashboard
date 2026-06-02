using ErrorOr;

namespace HackerDashboard.Application.Features.Weather.Common.Errors;

/// <summary>Reusable errors for the weather feature.</summary>
public static class WeatherErrors
{
    /// <summary>
    /// The upstream source was unreachable and no previous reading is cached, so there is no
    /// value to fall back to. Maps to 500.
    /// </summary>
    public static readonly Error Unavailable = Error.Unexpected(
        code: "Weather.Unavailable",
        description: "Weather is currently unavailable and no last known value exists.");
}
