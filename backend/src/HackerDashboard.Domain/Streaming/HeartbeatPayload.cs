namespace HackerDashboard.Domain.Streaming;

/// <summary>
/// Payload for the <see cref="DashboardChannels.Heartbeat"/> channel. The arrival (and the
/// envelope timestamp) keeps the client's live indicator green; <see cref="Sequence"/> is a
/// monotonic counter so clients can spot missed beats. Mirrors the contract in <c>contracts/</c>.
/// </summary>
/// <param name="Sequence">Monotonic beat counter since server start (starts at 1).</param>
public sealed record HeartbeatPayload(long Sequence);
