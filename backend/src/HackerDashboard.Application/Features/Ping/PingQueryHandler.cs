using HackerDashboard.Application.Common.Messaging;

namespace HackerDashboard.Application.Features.Ping;

public sealed class PingQueryHandler : IQueryHandler<PingQuery, PingResponse>
{
    public Task<PingResponse> Handle(PingQuery request, CancellationToken cancellationToken)
        => Task.FromResult(new PingResponse("pong", DateTimeOffset.UtcNow));
}
