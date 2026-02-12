using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using FlowForge.Application.Common.Models;
using FlowForge.Application.DTOs;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Project = FlowForge.Domain.Entities.Project;

namespace FlowForge.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IRepository<Project> _repository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateProjectDto> _validator;
    private readonly IAuditService _auditService;
    private readonly ICurrentUserService _currentUserService;

    public ProjectService(
        IRepository<Project> repository, 
        IMapper mapper, 
        IValidator<CreateProjectDto> validator,
        IAuditService auditService,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _mapper = mapper;
        _validator = validator;
        _auditService = auditService;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var project = _mapper.Map<Project>(dto);
        project.CreatedBy = _currentUserService.UserId ?? Guid.Empty;

        await _repository.AddAsync(project);
        
        await _auditService.LogAsync("Project", project.Id, "Created");

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> GetByIdAsync(Guid id)
    {
        var project = await _repository.GetByIdAsync(id);
        if (project == null) throw new KeyNotFoundException($"Project with ID {id} not found.");
        
        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<PagedResult<ProjectDto>> GetPagedAsync(int pageNumber, int pageSize)
    {
        var query = _repository.Query();
        
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
            
        var dtos = _mapper.Map<IEnumerable<ProjectDto>>(items);
        
        return new PagedResult<ProjectDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task UpdateAsync(Guid id, UpdateProjectDto dto)
    {
        var project = await _repository.GetByIdAsync(id);
        if (project == null) throw new KeyNotFoundException($"Project with ID {id} not found.");

        _mapper.Map(dto, project);
        
        await _repository.UpdateAsync(project);
    }

    public async Task DeleteAsync(Guid id)
    {
        var project = await _repository.GetByIdAsync(id);
        if (project == null) throw new KeyNotFoundException($"Project with ID {id} not found.");
        
        project.IsDeleted = true;
        await _repository.UpdateAsync(project);
        
        await _auditService.LogAsync("Project", id, "Deleted");
    }

    public async Task<IEnumerable<ProjectDto>> GetAllAsync()
    {
        var items = await _repository.Query().ToListAsync();
        return _mapper.Map<IEnumerable<ProjectDto>>(items);
    }
}
