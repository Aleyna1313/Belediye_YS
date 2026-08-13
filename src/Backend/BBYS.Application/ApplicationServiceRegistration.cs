using BBYS.Application.Interfaces;
using BBYS.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BBYS.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IMaterialService, MaterialService>();
        services.AddScoped<IRequestService, RequestService>();
        services.AddScoped<ITenderService, TenderService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        return services;
    }
}
