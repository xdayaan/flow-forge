using System;
using FlowForge.Domain.Entities;

namespace FlowForge.Application.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public FlowForge.Domain.Entities.TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public Guid? AssignedTo { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid ProjectId { get; set; }
    public string? ProjectName { get; set; }
}

public class CreateTaskDto
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public FlowForge.Domain.Entities.TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public Guid? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskDto : CreateTaskDto
{
}
