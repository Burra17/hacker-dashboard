namespace HackerDashboard.Application.Features.Sports.Common.Dtos;

/// <summary>Per-team summary: the most recent results and the upcoming fixture.</summary>
/// <param name="Team">Team name.</param>
/// <param name="RecentResults">The five most recent results (newest first), e.g. "Hammarby 2 - 0 AIK" (looped in the ticker).</param>
/// <param name="NextMatch">The upcoming fixture (shown in the sports panel).</param>
public sealed record TeamSportsDto(
    string Team,
    IReadOnlyList<string> RecentResults,
    NextMatchDto NextMatch);
