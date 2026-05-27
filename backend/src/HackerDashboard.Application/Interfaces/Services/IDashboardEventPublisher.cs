using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Publishes <see cref="DashboardEvent{T}"/>s to connected clients. Abstracts the SignalR
/// hub (owned by the API layer) so producers in Infrastructure can push events without
/// depending on the API — keeping the Clean Architecture dependency direction intact.
/// </summary>
public interface IDashboardEventPublisher
{
    Task PublishAsync<T>(DashboardEvent<T> dashboardEvent, CancellationToken cancellationToken = default);
}
