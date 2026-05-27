using Microsoft.AspNetCore.SignalR;

namespace HackerDashboard.API.Hubs;

/// <summary>
/// The single SignalR hub for all server -> client dashboard streaming.
/// V1 channels are static, so clients make no calls to the hub — producers push
/// <see cref="HackerDashboard.Domain.Streaming.DashboardEvent{T}"/> out via
/// <c>IHubContext&lt;DashboardHub&gt;</c> (issues 1.5/1.6). Connect/disconnect use the defaults.
/// </summary>
public sealed class DashboardHub : Hub
{
    /// <summary>
    /// The single client-side method every <c>DashboardEvent</c> is delivered on. The
    /// frontend registers one handler here and routes by <c>channel</c> to the right slice.
    /// </summary>
    public const string ReceiveEventMethod = "ReceiveDashboardEvent";
}
