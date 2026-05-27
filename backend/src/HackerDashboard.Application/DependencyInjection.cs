using Microsoft.Extensions.DependencyInjection;

namespace HackerDashboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // MediatR, validators and mapping profiles are registered here as features land.
        return services;
    }
}
