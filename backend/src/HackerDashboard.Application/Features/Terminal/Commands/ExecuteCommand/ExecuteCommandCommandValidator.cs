using FluentValidation;

namespace HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;

public sealed class ExecuteCommandCommandValidator : AbstractValidator<ExecuteCommandCommand>
{
    public ExecuteCommandCommandValidator()
    {
        RuleFor(x => x.Command.Raw).NotEmpty();
        RuleFor(x => x.Command.Verb).NotEmpty();
    }
}
