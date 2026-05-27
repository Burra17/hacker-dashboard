namespace HackerDashboard.Contracts;

/// <summary>Payload for the "heartbeat" channel — periodic liveness ping.</summary>
/// <param name="Sequence">Monotonic beat counter since server start (starts at 1).</param>
public sealed record HeartbeatPayload(long Sequence);
