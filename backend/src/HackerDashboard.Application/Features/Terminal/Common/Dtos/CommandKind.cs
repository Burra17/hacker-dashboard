namespace HackerDashboard.Application.Features.Terminal.Common.Dtos;

/// <summary>
/// Which subsystem produced a <see cref="CommandResult"/>. Serializes to camelCase
/// wire values ("ui", "data", "ai", "system") via JsonStringEnumConverter,
/// matching the TypeScript string-literal union.
/// </summary>
public enum CommandKind
{
    Ui,
    Data,
    Ai,
    System
}
