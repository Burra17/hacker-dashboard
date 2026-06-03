namespace HackerDashboard.Infrastructure.Settings;

/// <summary>
/// Strongly-typed settings for the external sports API ("Free API Live Football Data" via RapidAPI),
/// bound from "Sports". The API key is a secret — set it via <c>dotnet user-secrets</c>, never commit it.
/// </summary>
public sealed class SportsOptions
{
    public const string SectionName = "Sports";

    /// <summary>Base URL of the RapidAPI endpoint.</summary>
    public string BaseUrl { get; init; } = "https://free-api-live-football-data.p.rapidapi.com";

    /// <summary>RapidAPI key (secret — provide via user-secrets).</summary>
    public string ApiKey { get; init; } = "";

    /// <summary>RapidAPI host header value.</summary>
    public string ApiHost { get; init; } = "free-api-live-football-data.p.rapidapi.com";

    /// <summary>How long a fetched reading stays fresh before re-fetching, to respect rate limits.</summary>
    public int CacheHours { get; init; } = 3;

    /// <summary>IANA timezone used to render UTC kickoff times as display-ready local "HH:mm".</summary>
    public string Timezone { get; init; } = "Europe/Stockholm";

    /// <summary>Team id used to identify Hammarby's side of a match in the search results.</summary>
    public int HammarbyTeamId { get; init; } = 8248;

    /// <summary>Search term used to look up Hammarby's matches.</summary>
    public string HammarbyTeamName { get; init; } = "Hammarby";

    /// <summary>Team id used to identify Chelsea's side of a match in the search results.</summary>
    public int ChelseaTeamId { get; init; } = 8455;

    /// <summary>Search term used to look up Chelsea's matches.</summary>
    public string ChelseaTeamName { get; init; } = "Chelsea";
}
