namespace HackerDashboard.Contracts;

/// <summary>
/// One streamed chunk of an AI prompt response on the <c>terminal.response</c> channel.
/// Tokens arrive in order; the final event sets <see cref="Done"/> with an empty token.
/// </summary>
public sealed record TerminalResponsePayload(string Token, bool Done);
