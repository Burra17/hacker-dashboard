using System.Reflection;
using FluentValidation;
using HackerDashboard.Application.Common.Behaviours;
using Microsoft.Extensions.DependencyInjection;

namespace HackerDashboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        Assembly applicationAssembly = typeof(DependencyInjection).Assembly;
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(applicationAssembly);
            cfg.AddOpenBehavior(typeof(ValidationBehaviour<,>));
        });

        services.AddValidatorsFromAssembly(applicationAssembly);

        // Mapping profiles are registered here as features land.
        return services;
    }
}
