namespace HackerDashboard.Application.Features.Sports.Common.Dtos;

/// <summary>Per-team summary: the most recent result and the upcoming fixture.</summary>
/// <param name="Team">Team name.</param>
/// <param name="LatestResult">Most recent result, e.g. "Hammarby 2 - 0 AIK" (used in the ticker).</param>
/// <param name="NextMatch">The upcoming fixture (shown in the sports panel).</param>
public sealed record TeamSportsDto(
    string Team,
    string LatestResult,
    NextMatchDto NextMatch);
