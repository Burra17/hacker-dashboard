using HackerDashboard.Application.Interfaces.Services;
using HackerDashboard.Infrastructure.Settings;
using HackerDashboard.Infrastructure.Streaming;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HackerDashboard.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StreamingOptions>(configuration.GetSection(StreamingOptions.SectionName));

        // One store instance backs both the producer (writes) and the snapshot seam (reads).
        services.AddSingleton<SystemLogStore>();
        services.AddSingleton<ISystemLogStore>(sp => sp.GetRequiredService<SystemLogStore>());
        services.AddSingleton<ISnapshotProvider>(sp => sp.GetRequiredService<SystemLogStore>());

        services.AddHostedService<SystemLogProducer>();
        services.AddHostedService<HeartbeatProducer>();
        return services;
    }
}
