using System;
using System.Collections.Generic;

namespace FlowForge.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public bool IsArchived { get; set; }

    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
