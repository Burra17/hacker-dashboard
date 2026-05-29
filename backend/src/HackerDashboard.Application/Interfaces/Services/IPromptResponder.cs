namespace HackerDashboard.Application.Interfaces.Services;

/// <summary>
/// Produces an AI response to a prompt as an ordered stream of text chunks (tokens).
/// The seam that the terminal's <c>prompt</c> command streams over <c>terminal.response</c>;
/// the concrete implementation is a thin client over the external PromptVault API.
/// </summary>
public interface IPromptResponder
{
    IAsyncEnumerable<string> StreamAsync(string prompt, CancellationToken cancellationToken = default);
}
