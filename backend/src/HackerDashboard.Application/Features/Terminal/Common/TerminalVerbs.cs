namespace HackerDashboard.Application.Features.Terminal.Common;

/// <summary>Backend-handled terminal verbs. Pure-UI verbs (theme/toggle) are resolved on the frontend.</summary>
public static class TerminalVerbs
{
    /// <summary>Fetches recent system log lines on demand (data command).</summary>
    public const string Logs = "logs";

    /// <summary>Streams an AI response token-by-token over the terminal.response channel (ai command).</summary>
    public const string Prompt = "prompt";
}
