using System;
using System.Linq;
using System.Threading.Tasks;
using FlowForge.Application.DTOs;
using FlowForge.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project = FlowForge.Domain.Entities.Project;
using User = FlowForge.Domain.Entities.User;
using TaskEntity = FlowForge.Domain.Entities.Task;
using TaskStatus = FlowForge.Domain.Entities.TaskStatus;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IRepository<Project> _projectRepo;
    private readonly IRepository<TaskEntity> _taskRepo;
    private readonly IRepository<User> _userRepo;

    public DashboardController(
        IRepository<Project> projectRepo,
        IRepository<TaskEntity> taskRepo,
        IRepository<User> userRepo)
    {
        _projectRepo = projectRepo;
        _taskRepo = taskRepo;
        _userRepo = userRepo;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var projects = await _projectRepo.Query().ToListAsync(); // This handles tenant filtering automatically
        var tasks = await _taskRepo.Query().ToListAsync();

        var stats = new DashboardStatsDto
        {
            ActiveProjects = projects.Count(p => !p.IsArchived),
            CompletedTasks = tasks.Count(t => t.Status == TaskStatus.Done),
            PendingTasks = tasks.Count(t => t.Status != TaskStatus.Done),
            OverdueTasks = tasks.Count(t => t.DueDate < DateTime.UtcNow && t.Status != TaskStatus.Done)
        };

        return Ok(stats);
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult> GetRecentActivity()
    {
        // For now, simulate recent activity from latest tasks
        // In a real app, we'd have an AuditLog or ActivityLog table
        
        var recentTasks = await _taskRepo.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .ToListAsync();

        var activity = recentTasks.Select(t => new RecentActivityDto
        {
            Id = t.Id,
            ProjectName = t.Project?.Name ?? "Unknown Project",
            TaskTitle = t.Title,
            UserName = t.Assignee?.FullName ?? "Unassigned",
            Action = t.Status == TaskStatus.Done ? "Completed" : "Updated",
            Date = t.CreatedAt
        });

        return Ok(activity);
    }
}
