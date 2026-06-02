using ErrorOr;

namespace HackerDashboard.Application.Features.Sports.Common.Errors;

/// <summary>Reusable errors for the sports feature.</summary>
public static class SportsErrors
{
    /// <summary>
    /// The upstream source was unreachable and no previous reading is cached, so there is no
    /// value to fall back to. Maps to 500.
    /// </summary>
    public static readonly Error Unavailable = Error.Unexpected(
        code: "Sports.Unavailable",
        description: "Sports data is currently unavailable and no last known value exists.");
}
