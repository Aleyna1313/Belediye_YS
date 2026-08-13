using BBYS.Application.Interfaces;
using BBYS.Persistence.Context;
using BBYS.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BBYS.Persistence;

public static class PersistenceServiceRegistration
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        string provider = configuration["DatabaseProvider"] ?? "SqlServer";
        string connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=localhost;Database=BBYS_Db;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

        services.AddDbContext<AppDbContext>(options =>
        {
            if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite("Data Source=bbys.db", b => b.MigrationsAssembly("BBYS.Persistence"));
            }
            else
            {
                options.UseSqlServer(connectionString, b => b.MigrationsAssembly("BBYS.Persistence"));
            }
        });

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
