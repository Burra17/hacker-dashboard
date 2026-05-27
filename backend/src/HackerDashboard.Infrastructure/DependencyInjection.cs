using HackerDashboard.Infrastructure.Streaming;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HackerDashboard.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // External API clients and repositories are registered here as features land.
        services.AddHostedService<SystemLogProducer>();
        return services;
    }
}
