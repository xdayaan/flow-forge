using System;

namespace FlowForge.Domain.Entities;

public class TaskComment : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Comment { get; set; } = string.Empty;

    // Navigation
    public Task? Task { get; set; }
    public User? User { get; set; }
}
