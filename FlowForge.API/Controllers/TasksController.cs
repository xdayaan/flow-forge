using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlowForge.Application.DTOs;
using FlowForge.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskEntity = FlowForge.Domain.Entities.Task;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly IRepository<TaskEntity> _taskRepo;

    public record UpdateStatusDto(FlowForge.Domain.Entities.TaskStatus Status);

    public TasksController(IRepository<TaskEntity> taskRepo)
    {
        _taskRepo = taskRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _taskRepo.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .OrderByDescending(t => t.CreatedAt);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var dtos = items.Select(t => new TaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            AssignedTo = t.AssignedTo,
            AssigneeName = t.Assignee?.FullName,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt,
            ProjectId = t.ProjectId,
            ProjectName = t.Project?.Name
        });

        return Ok(new { Items = dtos, TotalCount = total });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var task = await _taskRepo.Query()
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        return Ok(new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            AssignedTo = task.AssignedTo,
            AssigneeName = task.Assignee?.FullName,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTaskDto dto)
    {
        var task = new TaskEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            ProjectId = dto.ProjectId,
            AssignedTo = dto.AssignedTo
        };

        await _taskRepo.AddAsync(task);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTaskDto dto)
    {
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.AssignedTo = dto.AssignedTo;
        // ProjectId usually doesn't change, but could allow if needed

        await _taskRepo.UpdateAsync(task);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
    {
        Console.WriteLine($"Updating task {id} status to {dto.Status}");
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();

        task.Status = dto.Status;
        try 
        {
            // Note: UpdateAsync is often redundant if the entity is already tracked by the context,
            // but let's keep the repository call if it handles SaveChanges.
            await _taskRepo.UpdateAsync(task);
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating task status: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"Inner Error: {ex.InnerException.Message}");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await _taskRepo.GetByIdAsync(id);
        if (task == null) return NotFound();

        await _taskRepo.DeleteAsync(task);
        return NoContent();
    }
}
