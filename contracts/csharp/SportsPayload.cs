namespace HackerDashboard.Contracts;

/// <summary>
/// Latest result and next fixture for the followed teams (Hammarby, Chelsea), fetched on demand
/// over HTTP (polled by the frontend via TanStack Query — not streamed over SignalR).
/// </summary>
/// <param name="Hammarby">Summary for Hammarby.</param>
/// <param name="Chelsea">Summary for Chelsea.</param>
/// <param name="ObservedAt">When the reading was produced (UTC).</param>
/// <param name="Stale">True when the upstream source was unavailable and this is the last known value.</param>
public sealed record SportsPayload(
    TeamSportsSummary Hammarby,
    TeamSportsSummary Chelsea,
    DateTimeOffset ObservedAt,
    bool Stale);

/// <summary>Per-team summary: the most recent result and the upcoming fixture.</summary>
/// <param name="Team">Team name.</param>
/// <param name="LatestResult">Most recent result, e.g. "Hammarby 2 - 0 AIK" (used in the ticker).</param>
/// <param name="NextMatch">The upcoming fixture (shown in the sports panel).</param>
public sealed record TeamSportsSummary(
    string Team,
    string LatestResult,
    NextMatch NextMatch);

/// <summary>An upcoming fixture, split into display-ready fields.</summary>
/// <param name="Date">Match date, ISO "yyyy-MM-dd".</param>
/// <param name="Time">Kick-off time, "HH:mm" (local).</param>
/// <param name="Opponent">The opposing team.</param>
public sealed record NextMatch(
    string Date,
    string Time,
    string Opponent);
