using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace HackerDashboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        Assembly applicationAssembly = typeof(DependencyInjection).Assembly;
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));

        // Validators and mapping profiles are registered here as features land.
        return services;
    }
}
