using HackerDashboard.Application.Features.SystemLogs.Common.Dtos;
using HackerDashboard.Application.Features.SystemLogs.Queries.GetSystemLogs;
using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Domain.Streaming;
using NSubstitute;

namespace HackerDashboard.Tests.Features.SystemLogs;

[TestFixture]
public sealed class GetSystemLogsQueryHandlerTests
{
    private ISystemLogStore _storeMock = null!;
    private GetSystemLogsQueryHandler _handler = null!;

    [SetUp]
    public void SetUp()
    {
        _storeMock = Substitute.For<ISystemLogStore>();
        _handler = new GetSystemLogsQueryHandler(_storeMock);
    }

    private static readonly SystemLogPayload[] Recent =
    [
        new(SystemLogLevel.Info, "kernel", "boot complete"),
        new(SystemLogLevel.Error, "net", "link down"),
        new(SystemLogLevel.Info, "auth", "login ok"),
    ];

    [Test]
    public async Task Handle_NoLevelFilter_ReturnsAllRecentLinesAsDtos()
    {
        _storeMock.GetRecent().Returns(Recent);

        SystemLogsResponse response = await _handler.Handle(new GetSystemLogsQuery(null), CancellationToken.None);

        Assert.That(response.Lines, Has.Count.EqualTo(3));
        Assert.That(response.Lines[1], Is.EqualTo(new SystemLogLineDto("Error", "net", "link down")));
    }

    [Test]
    public async Task Handle_LevelFilter_ReturnsOnlyMatchingLines()
    {
        _storeMock.GetRecent().Returns(Recent);

        SystemLogsResponse response =
            await _handler.Handle(new GetSystemLogsQuery(SystemLogLevel.Info), CancellationToken.None);

        Assert.That(response.Lines, Has.Count.EqualTo(2));
        Assert.That(response.Lines.Select(line => line.Level), Has.All.EqualTo("Info"));
    }
}
