using System;
using System.Threading.Tasks;

namespace FlowForge.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string entityType, Guid entityId, string action, string? changes = null);
}
