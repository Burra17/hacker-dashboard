using HackerDashboard.API.Hubs;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using Microsoft.AspNetCore.SignalR;

namespace HackerDashboard.API.Streaming;

/// <summary>
/// API-layer adapter fulfilling <see cref="IDashboardEventPublisher"/> by pushing events
/// through the SignalR <see cref="DashboardHub"/>. All connected clients receive every event
/// on <see cref="DashboardHub.ReceiveEventMethod"/> and route by channel themselves.
/// </summary>
public sealed class DashboardEventPublisher(IHubContext<DashboardHub> hubContext) : IDashboardEventPublisher
{
    public Task PublishAsync<T>(DashboardEvent<T> dashboardEvent, CancellationToken cancellationToken = default) =>
        hubContext.Clients.All.SendAsync(DashboardHub.ReceiveEventMethod, dashboardEvent, cancellationToken);
}
