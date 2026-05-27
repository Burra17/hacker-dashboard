using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using Microsoft.AspNetCore.SignalR;

namespace HackerDashboard.API.Hubs;

/// <summary>
/// The single SignalR hub for all server -> client dashboard streaming. V1 channels are static,
/// so clients make no calls to the hub — producers push <see cref="DashboardEvent{T}"/> out via
/// <c>IHubContext&lt;DashboardHub&gt;</c>. On connect the client is sent the current-state
/// snapshot for each channel, then resumes receiving deltas.
/// </summary>
public sealed class DashboardHub(IEnumerable<ISnapshotProvider> snapshotProviders) : Hub
{
    /// <summary>
    /// The single client-side method every <c>DashboardEvent</c> is delivered on. The
    /// frontend registers one handler here and routes by <c>channel</c> to the right slice.
    /// </summary>
    public const string ReceiveEventMethod = "ReceiveDashboardEvent";

    /// <summary>
    /// Sends the connecting client each channel's current-state <c>snapshot</c> before deltas
    /// resume, so it starts from a coherent baseline (the basis for Phase 3 reconnect handling).
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        foreach (ISnapshotProvider provider in snapshotProviders)
        {
            IDashboardEvent? snapshot = provider.GetSnapshot();
            if (snapshot is not null)
            {
                await Clients.Caller.SendAsync(ReceiveEventMethod, snapshot, Context.ConnectionAborted);
            }
        }

        await base.OnConnectedAsync();
    }
}
