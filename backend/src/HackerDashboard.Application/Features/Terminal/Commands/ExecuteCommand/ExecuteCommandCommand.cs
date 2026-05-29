using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;

namespace HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;

/// <summary>Dispatches a parsed terminal line for execution and returns its <see cref="CommandResult"/>.</summary>
public sealed record ExecuteCommandCommand(TerminalCommand Command) : ICommand<ErrorOr<CommandResult>>;
