using FluentValidation.TestHelper;
using HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;

namespace HackerDashboard.Tests.Features.Terminal;

[TestFixture]
public sealed class ExecuteCommandCommandValidatorTests
{
    private ExecuteCommandCommandValidator _validator = null!;

    [SetUp]
    public void SetUp() => _validator = new ExecuteCommandCommandValidator();

    private static ExecuteCommandCommand CommandWith(string raw, string verb) =>
        new(new TerminalCommand(raw, verb, new Dictionary<string, string>()));

    [Test]
    public void Validate_PopulatedRawAndVerb_IsValid()
    {
        var command = CommandWith("theme matrix", "theme");

        TestValidationResult<ExecuteCommandCommand> result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Test]
    public void Validate_EmptyVerb_HasError()
    {
        var command = CommandWith("theme matrix", "");

        TestValidationResult<ExecuteCommandCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Command.Verb);
    }

    [Test]
    public void Validate_EmptyRaw_HasError()
    {
        var command = CommandWith("", "theme");

        TestValidationResult<ExecuteCommandCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Command.Raw);
    }
}
