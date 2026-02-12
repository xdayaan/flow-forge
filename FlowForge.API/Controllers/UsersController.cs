using System;
using System.Linq;
using System.Threading.Tasks;
using FlowForge.Application.DTOs;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepo;

    public UsersController(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepo.Query().ToListAsync();
        return Ok(users.Select(u => MapToDto(u)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(MapToDto(user));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        if (await _userRepo.Query().IgnoreQueryFilters().AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest("Email already exists");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Role = dto.Role,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        await _userRepo.AddAsync(user);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, MapToDto(user));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateUserDto dto)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();

        // Check if email changed and if new email already exists
        if (user.Email != dto.Email && await _userRepo.Query().IgnoreQueryFilters().AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest("Email already exists");
        }

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Role = dto.Role;
        user.IsActive = dto.IsActive;

        await _userRepo.UpdateAsync(user);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return NotFound();

        await _userRepo.DeleteAsync(user);
        return NoContent();
    }

    private static UserDto MapToDto(User u) => new UserDto
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role,
        IsActive = u.IsActive
    };
}
