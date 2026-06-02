using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Prompts;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Streaming;
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

        // Thin typed client over the external PromptVault API (base URL from config).
        services.AddHttpClient<IPromptResponder, PromptVaultResponder>((sp, client) =>
        {
            PromptVaultOptions options = sp.GetRequiredService<IOptions<PromptVaultOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
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
