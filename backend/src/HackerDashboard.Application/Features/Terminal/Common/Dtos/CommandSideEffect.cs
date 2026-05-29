namespace HackerDashboard.Application.Features.Terminal.Common.Dtos;

/// <summary>
/// An instruction for the frontend to mutate its own state (e.g. switch theme).
/// The backend describes the intent; the frontend owns what it looks like.
/// </summary>
public sealed record CommandSideEffect(
    string Action,
    string? Target = null,
    string? Value = null);
