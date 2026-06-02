using System.Net;
using System.Text;
using HackerDashboard.Infrastructure.Prompts;

namespace HackerDashboard.Tests.Infrastructure.Prompts;

[TestFixture]
public sealed class PromptVaultResponderTests
{
    private sealed class StubHandler(string json) : HttpMessageHandler
    {
        public Uri? RequestUri { get; private set; }
        public string? RequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri;
            RequestBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json"),
            };
        }
    }

    [Test]
    public async Task StreamAsync_PostsPromptAndChunksResponseIntoReconstructableTokens()
    {
        var handler = new StubHandler("{\"response\":\"Hello world foo\"}");
        using var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost:5212") };
        var responder = new PromptVaultResponder(client);

        var tokens = new List<string>();
        await foreach (string token in responder.StreamAsync("hi there", CancellationToken.None))
        {
            tokens.Add(token);
        }

        Assert.That(tokens, Has.Count.EqualTo(3));
        Assert.That(string.Concat(tokens), Is.EqualTo("Hello world foo"));
        Assert.That(handler.RequestUri!.AbsolutePath, Is.EqualTo("/api/prompts/chat"));
        Assert.That(handler.RequestBody, Does.Contain("\"text\":\"hi there\""));
    }

    [Test]
    public async Task StreamAsync_EmptyResponse_YieldsNothing()
    {
        var handler = new StubHandler("{\"response\":\"\"}");
        using var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost:5212") };
        var responder = new PromptVaultResponder(client);

        var tokens = new List<string>();
        await foreach (string token in responder.StreamAsync("hi", CancellationToken.None))
        {
            tokens.Add(token);
        }

        Assert.That(tokens, Is.Empty);
    }
}
