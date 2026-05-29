using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;
using HackerDashboard.Application.Features.Terminal.Common;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using MediatR;

namespace HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;

/// <summary>
/// Routes a parsed terminal command to its backend handler. Pure-UI verbs (theme/toggle) are
/// resolved on the frontend and never reach here; unrecognised verbs echo back in-band.
/// </summary>
public sealed class ExecuteCommandCommandHandler(
    ISender sender,
    IPromptResponder promptResponder,
    IDashboardEventPublisher publisher)
    : ICommandHandler<ExecuteCommandCommand, ErrorOr<CommandResult>>
{
    public async Task<ErrorOr<CommandResult>> Handle(ExecuteCommandCommand request, CancellationToken cancellationToken)
    {
        TerminalCommand command = request.Command;

        return command.Verb switch
        {
            TerminalVerbs.Logs => await HandleLogsAsync(command, cancellationToken),
            TerminalVerbs.Prompt => await HandlePromptAsync(command, cancellationToken),
            _ => new CommandResult(false, CommandKind.System, $"unknown command: {command.Verb}"),
        };
    }

    private async Task<CommandResult> HandleLogsAsync(TerminalCommand command, CancellationToken cancellationToken)
    {
        string? levelArg = command.Args.GetValueOrDefault("0");
        SystemLogLevel? level = null;

        if (!string.IsNullOrWhiteSpace(levelArg))
        {
            if (!Enum.TryParse(levelArg, ignoreCase: true, out SystemLogLevel parsed) || !Enum.IsDefined(parsed))
            {
                return new CommandResult(
                    false,
                    CommandKind.Data,
                    $"unknown log level '{levelArg}' (debug, info, warning, error)");
            }

            level = parsed;
        }

        SystemLogsResponse response = await sender.Send(new GetSystemLogsQuery(level), cancellationToken);

        string output = response.Lines.Count == 0
            ? "no log lines"
            : string.Join("\n", response.Lines.Select(line => $"[{line.Level}] {line.Source}: {line.Message}"));

        return new CommandResult(true, CommandKind.Data, output);
    }

    private async Task<CommandResult> HandlePromptAsync(TerminalCommand command, CancellationToken cancellationToken)
    {
        string promptText = ExtractPromptText(command.Raw);
        if (string.IsNullOrWhiteSpace(promptText))
        {
            return new CommandResult(false, CommandKind.Ai, "usage: prompt <text>");
        }

        await foreach (string token in promptResponder.StreamAsync(promptText, cancellationToken))
        {
            await publisher.PublishAsync(ToResponseDelta(token, done: false), cancellationToken);
        }

        await publisher.PublishAsync(ToResponseDelta(string.Empty, done: true), cancellationToken);

        // The streamed tokens are the response; the HTTP ack carries no output of its own.
        return new CommandResult(true, CommandKind.Ai, string.Empty);
    }

    private static string ExtractPromptText(string raw)
    {
        string trimmed = raw.TrimStart();
        int firstSpace = trimmed.IndexOf(' ');
        return firstSpace < 0 ? string.Empty : trimmed[(firstSpace + 1)..].Trim();
    }

    private static DashboardEvent<TerminalResponsePayload> ToResponseDelta(string token, bool done) =>
        new(
            EventId: Guid.NewGuid().ToString(),
            Channel: DashboardChannels.TerminalResponse,
            Type: DashboardEventType.Delta,
            Timestamp: DateTimeOffset.UtcNow,
            Payload: new TerminalResponsePayload(token, done));
}
