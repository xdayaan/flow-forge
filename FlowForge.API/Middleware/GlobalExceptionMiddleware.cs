using System;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace FlowForge.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        // Default
        var statusCode = HttpStatusCode.InternalServerError;
        object response = new { message = "An error occurred while processing your request." };

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = HttpStatusCode.BadRequest;
                var errors = validationEx.Errors.Select(e => new { Field = e.PropertyName, Error = e.ErrorMessage });
                response = new { message = "Validation Failed", errors };
                break;
            
            case KeyNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                response = new { message = exception.Message };
                break;
                
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                response = new { message = "Unauthorized" };
                break;
                
            case ApplicationException appEx:
                 statusCode = HttpStatusCode.BadRequest;
                 response = new { message = appEx.Message };
                 break;
        }

        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
