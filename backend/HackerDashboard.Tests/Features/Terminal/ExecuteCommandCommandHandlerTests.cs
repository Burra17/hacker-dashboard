using ErrorOr;
using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;
using HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;
using HackerDashboard.Domain.Streaming;
using MediatR;
using NSubstitute;

namespace HackerDashboard.Tests.Features.Terminal;

[TestFixture]
public sealed class ExecuteCommandCommandHandlerTests
{
    private ISender _senderMock = null!;
    private ExecuteCommandCommandHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _senderMock = Substitute.For<ISender>();
        _handler = new ExecuteCommandCommandHandler(_senderMock);
    }

    private static ExecuteCommandCommand CommandWith(string verb, params (string Key, string Value)[] args)
    {
        var dict = args.ToDictionary(pair => pair.Key, pair => pair.Value);
        return new ExecuteCommandCommand(new TerminalCommand(verb, verb, dict));
    }

    [Test]
    public async Task Handle_UnknownVerb_ReturnsUnsuccessfulSystemResult()
    {
        ErrorOr<CommandResult> result = await _handler.Handle(CommandWith("nope"), CancellationToken.None);

        Assert.That(result.IsError, Is.False);
        Assert.That(result.Value.Success, Is.False);
        Assert.That(result.Value.Kind, Is.EqualTo(CommandKind.System));
        Assert.That(result.Value.Output, Does.Contain("nope"));
    }

    [Test]
    public async Task Handle_LogsVerb_DispatchesQueryAndReturnsDataResult()
    {
        _senderMock
            .Send(Arg.Any<GetSystemLogsQuery>(), Arg.Any<CancellationToken>())
            .Returns(new SystemLogsResponse([new SystemLogLineDto("Error", "net", "link down")]));

        ErrorOr<CommandResult> result = await _handler.Handle(CommandWith("logs"), CancellationToken.None);

        await _senderMock.Received(1).Send(Arg.Any<GetSystemLogsQuery>(), Arg.Any<CancellationToken>());
        Assert.That(result.Value.Success, Is.True);
        Assert.That(result.Value.Kind, Is.EqualTo(CommandKind.Data));
        Assert.That(result.Value.Output, Does.Contain("[Error] net: link down"));
    }

    [Test]
    public async Task Handle_LogsVerbWithLevelArg_PassesParsedLevelToQuery()
    {
        _senderMock
            .Send(Arg.Any<GetSystemLogsQuery>(), Arg.Any<CancellationToken>())
            .Returns(new SystemLogsResponse([]));

        await _handler.Handle(CommandWith("logs", ("0", "error")), CancellationToken.None);

        await _senderMock
            .Received(1)
            .Send(Arg.Is<GetSystemLogsQuery>(query => query.Level == SystemLogLevel.Error), Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_LogsVerbWithUnknownLevel_ReturnsErrorAndDispatchesNoQuery()
    {
        ErrorOr<CommandResult> result =
            await _handler.Handle(CommandWith("logs", ("0", "bogus")), CancellationToken.None);

        Assert.That(result.Value.Success, Is.False);
        Assert.That(result.Value.Output, Does.Contain("bogus"));
        await _senderMock.DidNotReceive().Send(Arg.Any<GetSystemLogsQuery>(), Arg.Any<CancellationToken>());
    }
}
