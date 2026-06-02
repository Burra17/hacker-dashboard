using ErrorOr;
using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;
using HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using MediatR;
using NSubstitute;

namespace HackerDashboard.Tests.Features.Terminal;

[TestFixture]
public sealed class ExecuteCommandCommandHandlerTests
{
    private ISender _senderMock = null!;
    private IPromptResponder _promptResponderMock = null!;
    private IDashboardEventPublisher _publisherMock = null!;
    private ExecuteCommandCommandHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _senderMock = Substitute.For<ISender>();
        _promptResponderMock = Substitute.For<IPromptResponder>();
        _publisherMock = Substitute.For<IDashboardEventPublisher>();
        _handler = new ExecuteCommandCommandHandler(_senderMock, _promptResponderMock, _publisherMock);
    }

    private static ExecuteCommandCommand Command(string raw, string verb, params (string Key, string Value)[] args)
    {
        var dict = args.ToDictionary(pair => pair.Key, pair => pair.Value);
        return new ExecuteCommandCommand(new TerminalCommand(raw, verb, dict));
    }

    private static async IAsyncEnumerable<string> AsyncTokens(params string[] tokens)
    {
        foreach (string token in tokens)
        {
            yield return token;
            await Task.CompletedTask;
        }
    }

    [Test]
    public async Task Handle_UnknownVerb_ReturnsUnsuccessfulSystemResult()
    {
        ErrorOr<CommandResult> result = await _handler.Handle(Command("nope", "nope"), CancellationToken.None);

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

        ErrorOr<CommandResult> result = await _handler.Handle(Command("logs", "logs"), CancellationToken.None);

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

        await _handler.Handle(Command("logs error", "logs", ("0", "error")), CancellationToken.None);

        await _senderMock
            .Received(1)
            .Send(Arg.Is<GetSystemLogsQuery>(query => query.Level == SystemLogLevel.Error), Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_LogsVerbWithUnknownLevel_ReturnsErrorAndDispatchesNoQuery()
    {
        ErrorOr<CommandResult> result =
            await _handler.Handle(Command("logs bogus", "logs", ("0", "bogus")), CancellationToken.None);

        Assert.That(result.Value.Success, Is.False);
        Assert.That(result.Value.Output, Does.Contain("bogus"));
        await _senderMock.DidNotReceive().Send(Arg.Any<GetSystemLogsQuery>(), Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task Handle_PromptVerb_StreamsEachTokenThenDoneAndReturnsAiAck()
    {
        _promptResponderMock
            .StreamAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(AsyncTokens("Hello", " world"));

        ErrorOr<CommandResult> result =
            await _handler.Handle(Command("prompt say hi", "prompt", ("0", "say"), ("1", "hi")), CancellationToken.None);

        _promptResponderMock.Received(1).StreamAsync("say hi", Arg.Any<CancellationToken>());
        // Two token events + one done event.
        await _publisherMock.Received(3)
            .PublishAsync(Arg.Any<DashboardEvent<TerminalResponsePayload>>(), Arg.Any<CancellationToken>());
        await _publisherMock.Received(1)
            .PublishAsync(Arg.Is<DashboardEvent<TerminalResponsePayload>>(e => e.Payload.Done), Arg.Any<CancellationToken>());
        Assert.That(result.Value.Success, Is.True);
        Assert.That(result.Value.Kind, Is.EqualTo(CommandKind.Ai));
        Assert.That(result.Value.Output, Is.Empty);
    }

    [Test]
    public async Task Handle_PromptVerbWithNoText_ReturnsUsageAndStreamsNothing()
    {
        ErrorOr<CommandResult> result = await _handler.Handle(Command("prompt", "prompt"), CancellationToken.None);

        Assert.That(result.Value.Success, Is.False);
        Assert.That(result.Value.Output, Does.Contain("usage"));
        _promptResponderMock.DidNotReceive().StreamAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _publisherMock.DidNotReceive()
            .PublishAsync(Arg.Any<DashboardEvent<TerminalResponsePayload>>(), Arg.Any<CancellationToken>());
    }
}
