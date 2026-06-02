using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;

namespace HackerDashboard.Application.Features.Sports.Queries.GetSports;

public sealed class GetSportsQueryHandler(ISportsProvider sportsProvider)
    : IQueryHandler<GetSportsQuery, ErrorOr<SportsDto>>
{
    public Task<ErrorOr<SportsDto>> Handle(GetSportsQuery request, CancellationToken cancellationToken) =>
        sportsProvider.GetCurrentAsync(cancellationToken);
}
