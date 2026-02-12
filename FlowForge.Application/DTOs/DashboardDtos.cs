using System;

namespace FlowForge.Application.DTOs;

public class DashboardStatsDto
{
    public int ActiveProjects { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
}

public class RecentActivityDto
{
    public Guid Id { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}
