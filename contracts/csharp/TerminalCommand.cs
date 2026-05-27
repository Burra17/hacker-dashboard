namespace HackerDashboard.Contracts;

/// <summary>A terminal line parsed into a verb and its arguments, sent to the backend over HTTP.</summary>
/// <param name="Raw">Exactly what the user typed — kept for terminal history.</param>
/// <param name="Verb">The action, e.g. "theme", "toggle", "prompt", "fetch".</param>
public sealed record TerminalCommand(
    string Raw,
    string Verb,
    IReadOnlyDictionary<string, string> Args);
