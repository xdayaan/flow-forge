using System;

namespace FlowForge.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; } // Still tied to a tenant
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Action { get; set; } = string.Empty; // Created, Updated, Deleted
    public string PerformedBy { get; set; } = string.Empty; // Username or Email
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
