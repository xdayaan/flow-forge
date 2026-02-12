using AutoMapper;
using FlowForge.Domain.Entities;
using FlowForge.Application.DTOs;

namespace FlowForge.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Project, ProjectDto>().ReverseMap();
        CreateMap<CreateProjectDto, Project>();
        CreateMap<UpdateProjectDto, Project>();
    }
}
