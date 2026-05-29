using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;

namespace HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;

public sealed class ExecuteCommandCommandHandler
    : ICommandHandler<ExecuteCommandCommand, ErrorOr<CommandResult>>
{
    // Verb routing (ui/data/ai/system) lands in issues 4.3+. Until then every recognised request
    // produces an in-band "unknown command" result — the terminal echoes it rather than erroring.
    public Task<ErrorOr<CommandResult>> Handle(ExecuteCommandCommand request, CancellationToken cancellationToken)
    {
        var result = new CommandResult(
            Success: false,
            Kind: CommandKind.System,
            Output: $"unknown command: {request.Command.Verb}");

        return Task.FromResult<ErrorOr<CommandResult>>(result);
    }
}
