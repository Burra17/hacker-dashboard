using ErrorOr;
using HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;

namespace HackerDashboard.Tests.Features.Terminal;

[TestFixture]
public sealed class ExecuteCommandCommandHandlerTests
{
    private ExecuteCommandCommandHandler _handler = null!;

    [SetUp]
    public void SetUp() => _handler = new ExecuteCommandCommandHandler();

    [Test]
    public async Task Handle_UnknownVerb_ReturnsUnsuccessfulSystemResult()
    {
        var command = new ExecuteCommandCommand(
            new TerminalCommand("nope", "nope", new Dictionary<string, string>()));

        ErrorOr<CommandResult> result = await _handler.Handle(command, CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Success, Is.False);
        Assert.That(result.Value.Kind, Is.EqualTo(CommandKind.System));
        Assert.That(result.Value.Output, Does.Contain("nope"));
    }
}
