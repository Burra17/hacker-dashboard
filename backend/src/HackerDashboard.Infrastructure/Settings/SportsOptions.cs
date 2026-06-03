namespace HackerDashboard.Infrastructure.Settings;

/// <summary>
/// Strongly-typed settings for the external sports API (API-Football via RapidAPI), bound from
/// "Sports". The API key is a secret — set it via <c>dotnet user-secrets</c>, never commit it.
/// </summary>
public sealed class SportsOptions
{
    public const string SectionName = "Sports";

    /// <summary>Base URL of the RapidAPI API-Football endpoint.</summary>
    public string BaseUrl { get; init; } = "https://api-football-v1.p.rapidapi.com";

    /// <summary>RapidAPI key (secret — provide via user-secrets).</summary>
    public string ApiKey { get; init; } = "";

    /// <summary>RapidAPI host header value.</summary>
    public string ApiHost { get; init; } = "api-football-v1.p.rapidapi.com";

    /// <summary>How long a fetched reading stays fresh before re-fetching, to respect rate limits.</summary>
    public int CacheHours { get; init; } = 3;

    /// <summary>IANA timezone for fixture kickoff times, so the API returns display-ready local "HH:mm".</summary>
    public string Timezone { get; init; } = "Europe/Stockholm";

    /// <summary>API-Football team id for Hammarby (placeholder — verify when wiring the real API).</summary>
    public int HammarbyTeamId { get; init; } = 375;

    /// <summary>API-Football team id for Chelsea (placeholder — verify when wiring the real API).</summary>
    public int ChelseaTeamId { get; init; } = 49;
}
