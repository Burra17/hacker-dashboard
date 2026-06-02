namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// One streamed chunk of an AI prompt response on the <see cref="DashboardChannels.TerminalResponse"/>
/// channel. Tokens arrive in order; the final event sets <see cref="Done"/> with an empty token.
/// Mirrors the shared contract in <c>contracts/</c>.
/// </summary>
public sealed record TerminalResponsePayload(string Token, bool Done);
