using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Domain.Streaming;

namespace HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;

/// <summary>Fetches the recent system log lines on demand, optionally filtered by severity.</summary>
/// <param name="Level">When set, only lines of this severity are returned.</param>
public sealed record GetSystemLogsQuery(SystemLogLevel? Level) : IQuery<SystemLogsResponse>;
