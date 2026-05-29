namespace HackerDashboard.Infrastructure.Settings;

/// <summary>Strongly-typed settings for the external PromptVault API, bound from "PromptVault".</summary>
public sealed class PromptVaultOptions
{
    public const string SectionName = "PromptVault";

    /// <summary>Base URL of the PromptVault REST API.</summary>
    public string BaseUrl { get; init; } = "http://localhost:5212";
}
