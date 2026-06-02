using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using HackerDashboard.Application.Interfaces.Services;

namespace HackerDashboard.Infrastructure.Prompts;

/// <summary>
/// Thin client over the external PromptVault API. Posts the prompt, reads the complete answer,
/// then yields it word-by-word so the terminal still gets a streaming feel. The dashboard owns
/// no AI logic — it just forwards the question to PromptVault.
/// </summary>
public sealed class PromptVaultResponder(HttpClient httpClient) : IPromptResponder
{
    private const string ChatPath = "api/prompts/chat";
    private static readonly TimeSpan WordDelay = TimeSpan.FromMilliseconds(40);

    public async IAsyncEnumerable<string> StreamAsync(
        string prompt,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        using HttpResponseMessage response =
            await httpClient.PostAsJsonAsync(ChatPath, new ChatRequest(prompt), cancellationToken);
        response.EnsureSuccessStatusCode();

        ChatResponse? body = await response.Content.ReadFromJsonAsync<ChatResponse>(cancellationToken);
        string text = body?.Response ?? string.Empty;

        if (text.Length == 0)
        {
            yield break;
        }

        string[] words = text.Split(' ');
        for (int index = 0; index < words.Length; index++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            // Re-attach the separating space so the client concatenation reproduces the text.
            yield return index == 0 ? words[index] : " " + words[index];
            await Task.Delay(WordDelay, cancellationToken);
        }
    }

    private sealed record ChatRequest([property: JsonPropertyName("text")] string Text);

    private sealed record ChatResponse([property: JsonPropertyName("response")] string? Response);
}
