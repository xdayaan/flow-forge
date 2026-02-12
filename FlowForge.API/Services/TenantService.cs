using System;
using System.Security.Claims;
using FlowForge.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FlowForge.API.Services;

public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.User == null) return null;

            // Extract from standard claim or custom claim "tenant_id"
            // Assuming the JWT issuing logic puts it in "tenant_id"
            var claim = context.User.FindFirst("tenant_id"); 
            if (claim != null && Guid.TryParse(claim.Value, out var tenantId))
            {
                return tenantId;
            }
            return null;
        }
    }
}
