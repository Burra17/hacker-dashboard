namespace HackerDashboard.Application.Features.Terminal.Common.Dtos;

/// <summary>The backend's response to a <see cref="TerminalCommand"/>, echoed in the terminal.</summary>
/// <param name="Output">Text rendered in the terminal history.</param>
public sealed record CommandResult(
    bool Success,
    CommandKind Kind,
    string Output,
    CommandSideEffect? SideEffect = null);
