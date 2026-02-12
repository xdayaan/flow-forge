using System;
using System.Threading.Tasks;
using FlowForge.Application.Common.Models;
using FlowForge.Application.DTOs;

namespace FlowForge.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(CreateProjectDto dto);
    Task<ProjectDto> GetByIdAsync(Guid id);
    Task<PagedResult<ProjectDto>> GetPagedAsync(int pageNumber, int pageSize);
    Task UpdateAsync(Guid id, UpdateProjectDto dto);
    Task DeleteAsync(Guid id);
}
