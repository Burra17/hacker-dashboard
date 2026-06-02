using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Sports.Common.Dtos;

namespace HackerDashboard.Application.Features.Sports.Queries.GetSports;

/// <summary>Fetches the latest result and next fixture for the followed teams on demand.</summary>
public sealed record GetSportsQuery : IQuery<ErrorOr<SportsDto>>;
