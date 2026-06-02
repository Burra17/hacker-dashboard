namespace HackerDashboard.Application.Features.Sports.Common.Dtos;

/// <summary>An upcoming fixture, split into display-ready fields.</summary>
/// <param name="Date">Match date, ISO "yyyy-MM-dd".</param>
/// <param name="Time">Kick-off time, "HH:mm" (local).</param>
/// <param name="Opponent">The opposing team.</param>
public sealed record NextMatchDto(
    string Date,
    string Time,
    string Opponent);
