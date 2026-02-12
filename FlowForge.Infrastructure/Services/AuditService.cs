using System;
using System.Threading.Tasks;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Interfaces;
using FlowForge.Infrastructure.Data;
using AuditLog = FlowForge.Domain.Entities.AuditLog;

namespace FlowForge.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantService _tenantService;

    public AuditService(AppDbContext context, ICurrentUserService currentUserService, ITenantService tenantService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _tenantService = tenantService;
    }

    public async Task LogAsync(string entityType, Guid entityId, string action, string? changes = null)
    {
        var log = new AuditLog
        {
            OrganizationId = _tenantService.TenantId ?? Guid.Empty,
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            PerformedBy = _currentUserService.UserEmail ?? "System",
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
