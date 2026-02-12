using System;
using System.Text.Json.Serialization;

namespace FlowForge.Domain.Entities;

public class User : BaseEntity
{
    // TenantId is inherited from BaseEntity, acts as OrganizationId

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization? Organization { get; set; }
}

public enum UserRole
{
    Admin,
    Manager,
    Member
}
