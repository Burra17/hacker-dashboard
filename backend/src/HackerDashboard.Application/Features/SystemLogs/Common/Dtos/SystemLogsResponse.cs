namespace HackerDashboard.Application.Features.SystemLogs.Common.Dtos;

/// <summary>The recent system log lines returned by an on-demand fetch, oldest first.</summary>
public sealed record SystemLogsResponse(IReadOnlyList<SystemLogLineDto> Lines);
