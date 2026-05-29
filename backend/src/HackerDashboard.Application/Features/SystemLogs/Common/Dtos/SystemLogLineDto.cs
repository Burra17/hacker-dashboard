namespace HackerDashboard.Application.Features.SystemLogs.Common.Dtos;

/// <summary>A single system log line shaped for read responses (level as a string).</summary>
public sealed record SystemLogLineDto(string Level, string Source, string Message);
