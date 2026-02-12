using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Task = FlowForge.Domain.Entities.Task;

namespace FlowForge.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Task> Tasks { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure xmin for Optimistic Concurrency in PostgreSQL manually
        builder.Entity<Task>()
            .Property<uint>("xmin")
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken();

        // Configure Relationships
        builder.Entity<Organization>()
            .HasMany(o => o.Projects)
            .WithOne() // Project does not have Navigation to Organization
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Organization>()
            .HasMany(o => o.Users)
            .WithOne(u => u.Organization)
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Apply Global Query Filters
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            // check if type derives from BaseEntity
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                
                // Tenant Filter: e => e.TenantId == _tenantService.TenantId
                // We need to capture the _tenantService instance/property in the expression? 
                // Creating expression tree for: e.TenantId == _tenantService.TenantId
                // But _tenantService is instance field. EF Core allows instance access in filter?
                // Yes, if we use a closure or access it via property.
                // Actually, clean way is: e.TenantId == _tenantService.TenantId.GetValueOrDefault()
                // But filters are compiled once. We need a way to pass the dynamic value.
                // EF Core supports this if we supply a method or property access.
                
                // Soft Delete Filter: e => !e.IsDeleted
                
                // Combining them: e => e.TenantId == tenantId && !e.IsDeleted
                
                // Simplified manual application for readability in this generation:
                // I will apply it using method calls for specific entities to ensure correctness
            }
        }
        
        // Manual Application for safety and clarity
        builder.Entity<Project>().HasQueryFilter(e => e.TenantId == _tenantService.TenantId && !e.IsDeleted);
        builder.Entity<Task>().HasQueryFilter(e => e.TenantId == _tenantService.TenantId && !e.IsDeleted);
        builder.Entity<TaskComment>().HasQueryFilter(e => e.TenantId == _tenantService.TenantId && !e.IsDeleted);
        builder.Entity<User>().HasQueryFilter(e => e.TenantId == _tenantService.TenantId && !e.IsDeleted);
        // Organization is special, it IS the tenant definition.
        // Usually we filter Organization by Id == TenantId ??
        builder.Entity<Organization>().HasQueryFilter(e => e.Id == _tenantService.TenantId && !e.IsDeleted);

        // Configure DateTime properties for PostgreSQL UTC requirement
        var dateTimeConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
            v => !v.HasValue ? v : (v.Value.Kind == DateTimeKind.Utc ? v : v.Value.ToUniversalTime()),
            v => !v.HasValue ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc));

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantService.TenantId;
        
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (tenantId.HasValue && entry.Entity.TenantId == Guid.Empty)
                    {
                        entry.Entity.TenantId = tenantId.Value;
                    }
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                
                case EntityState.Deleted:
                    // Soft Delete
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    break;
            }
        }

        // Ensure all DateTime properties are UTC for Npgsql compatibility
        foreach (var entry in ChangeTracker.Entries())
        {
            foreach (var property in entry.Properties)
            {
                if (property.Metadata.ClrType == typeof(DateTime) || property.Metadata.ClrType == typeof(DateTime?))
                {
                    if (property.CurrentValue is DateTime dt)
                    {
                        if (dt.Kind == DateTimeKind.Unspecified)
                        {
                            property.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                        }
                        else if (dt.Kind == DateTimeKind.Local)
                        {
                            property.CurrentValue = dt.ToUniversalTime();
                        }
                    }
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
