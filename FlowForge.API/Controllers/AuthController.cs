using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FlowForge.Application.DTOs;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FlowForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<Organization> _orgRepo;
    private readonly IConfiguration _configuration;

    public AuthController(
        IRepository<User> userRepo,
        IRepository<Organization> orgRepo,
        IConfiguration configuration)
    {
        _userRepo = userRepo;
        _orgRepo = orgRepo;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // 1. Create Organization
        var org = new Organization
        {
            Name = request.OrganizationName,
            IsActive = true
            // TenantId will be its own Id usually, but BaseEntity sets TenantId.
            // For Organization, its TenantId should be itself. 
            // SaveChangesAsync logic sets TenantId if empty. 
            // But we need the ID to be same as TenantId.
            // Let's set ID manually or let it generate, then set TenantId to Id.
        };
        
        // We need to bypass the Tenant Filter for registration?
        // Or we set TenantId explicitly so it doesn't get filtered out if we query it?
        // Actually, this is the "Root" creation.
        // We'll add Org first.
        
        // This is tricky with the Global Query Filter and automatic TenantId setting.
        // SaveChangesAsync sets TenantId = _tenantService.TenantId.
        // But for registration, _tenantService.TenantId is null.
        // So automatic setting won't work or will fail if TenantId is required.
        // We should set TenantId manually here.
        
        org.Id = Guid.NewGuid();
        org.TenantId = org.Id; // Tenant is itself
        
        await _orgRepo.AddAsync(org);
        
        // 2. Create User
        var user = new User
        {
            // OrganizationId = org.Id, // TenantId is sufficient
            TenantId = org.Id,
            FullName = request.FullName,
            Email = request.Email,
            Role = UserRole.Admin,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };
        
        await _userRepo.AddAsync(user);

        var token = GenerateJwt(user);
        
        return Ok(new AuthResponse { Token = token, TenantId = org.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userRepo.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials");
        }
        
        if (!user.IsActive) return Unauthorized("User is inactive");

        var token = GenerateJwt(user);
        return Ok(new AuthResponse { Token = token, TenantId = user.TenantId });
    }

    private string GenerateJwt(User user)
    {
        var keyString = _configuration["Jwt:Key"] ?? "super_secret_key_1234567890123456";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("tenant_id", user.TenantId.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
