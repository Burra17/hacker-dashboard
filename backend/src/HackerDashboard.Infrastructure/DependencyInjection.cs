using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Prompts;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Sports;
using HackerDashboard.Infrastructure.Streaming;
using HackerDashboard.Infrastructure.Weather;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace HackerDashboard.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StreamingOptions>(configuration.GetSection(StreamingOptions.SectionName));
        services.Configure<PromptVaultOptions>(configuration.GetSection(PromptVaultOptions.SectionName));
        services.Configure<WeatherOptions>(configuration.GetSection(WeatherOptions.SectionName));
        services.Configure<SportsOptions>(configuration.GetSection(SportsOptions.SectionName));

        // Thin typed client over the external PromptVault API (base URL from config).
        services.AddHttpClient<IPromptResponder, PromptVaultResponder>((sp, client) =>
        {
            PromptVaultOptions options = sp.GetRequiredService<IOptions<PromptVaultOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
        });

        // Last known weather reading, shared between fetches so the source going down degrades to stale.
        services.AddSingleton<WeatherCache>();

        // Thin typed client over the keyless Open-Meteo API (base URL from config).
        services.AddHttpClient<IWeatherProvider, OpenMeteoWeatherClient>((sp, client) =>
        {
            WeatherOptions options = sp.GetRequiredService<IOptions<WeatherOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
        });

        // Last known sports reading, shared so a re-fetch is skipped within the TTL and the source
        // going down degrades to stale.
        services.AddSingleton<SportsCache>();

        // Typed client over the "Free API Live Football Data" RapidAPI. Base URL + the RapidAPI auth
        // headers come from SportsOptions; the key is a user-secret, never committed.
        services.AddHttpClient<ISportsProvider, RapidApiSportsClient>((sp, client) =>
        {
            SportsOptions options = sp.GetRequiredService<IOptions<SportsOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
            client.DefaultRequestHeaders.Add(RapidApiSportsClient.RapidApiKeyHeader, options.ApiKey);
            client.DefaultRequestHeaders.Add(RapidApiSportsClient.RapidApiHostHeader, options.ApiHost);
        });

        // One store instance backs both the producer (writes) and the snapshot seam (reads).
        services.AddSingleton<SystemLogStore>();
        services.AddSingleton<ISystemLogStore>(sp => sp.GetRequiredService<SystemLogStore>());
        services.AddSingleton<ISnapshotProvider>(sp => sp.GetRequiredService<SystemLogStore>());

        services.AddHostedService<SystemLogProducer>();
        services.AddHostedService<HeartbeatProducer>();
        return services;
    }
}
