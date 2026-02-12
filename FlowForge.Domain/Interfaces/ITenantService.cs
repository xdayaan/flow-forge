using System;

namespace FlowForge.Domain.Interfaces;

public interface ITenantService
{
    Guid? TenantId { get; }
}
