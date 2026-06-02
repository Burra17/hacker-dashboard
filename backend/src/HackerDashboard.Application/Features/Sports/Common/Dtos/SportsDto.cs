namespace HackerDashboard.Application.Features.Sports.Common.Dtos;

/// <summary>
/// Latest result and next fixture for the followed teams. Mirrors the <c>SportsPayload</c>
/// contract in <c>contracts/</c>.
/// </summary>
/// <param name="Hammarby">Summary for Hammarby.</param>
/// <param name="Chelsea">Summary for Chelsea.</param>
/// <param name="ObservedAt">When the reading was produced (UTC).</param>
/// <param name="Stale">True when the source was unavailable and this is the last known value.</param>
public sealed record SportsDto(
    TeamSportsDto Hammarby,
    TeamSportsDto Chelsea,
    DateTimeOffset ObservedAt,
    bool Stale);
