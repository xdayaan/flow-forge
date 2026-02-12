using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using FlowForge.Application.Services;
using FlowForge.Application.Interfaces;

namespace FlowForge.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Mappings.MappingProfile));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddScoped<IProjectService, ProjectService>();
        return services;
    }
}
