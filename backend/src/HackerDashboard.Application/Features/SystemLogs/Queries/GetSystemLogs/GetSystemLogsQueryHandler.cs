using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;

public sealed class GetSystemLogsQueryHandler(ISystemLogStore store)
    : IQueryHandler<GetSystemLogsQuery, SystemLogsResponse>
{
    public Task<SystemLogsResponse> Handle(GetSystemLogsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<SystemLogPayload> lines = store.GetRecent();

        if (request.Level is { } level)
        {
            lines = lines.Where(line => line.Level == level);
        }

        var dtos = lines
            .Select(line => new SystemLogLineDto(line.Level.ToString(), line.Source, line.Message))
            .ToList();

        return Task.FromResult(new SystemLogsResponse(dtos));
    }
}
