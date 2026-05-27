using HackerDashboard.Application.Common.Messaging;

namespace HackerDashboard.Application.Features.Ping;

/// <summary>Smoke-test query that verifies the MediatR pipeline is wired end to end.</summary>
public sealed record PingQuery : IQuery<PingResponse>;
