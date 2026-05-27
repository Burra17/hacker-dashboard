namespace HackerDashboard.Application.Features.Ping;

/// <param name="Message">Always "pong" — proves the handler ran.</param>
/// <param name="Timestamp">Server time (UTC) the handler produced the response.</param>
public sealed record PingResponse(string Message, DateTimeOffset Timestamp);
