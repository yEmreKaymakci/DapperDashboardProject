using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace DapperDashboardProject.Middlewares
{
    public class SimpleExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SimpleExceptionMiddleware> _logger;

        public SimpleExceptionMiddleware(RequestDelegate next, ILogger<SimpleExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Uygulamada beklenmeyen bir hata oluştu: {Message}", ex.Message);
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var response = new
            {
                error = true,
                message = "Sistemde bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                details = exception.Message // Küçük ölçekli projeler için detayı dönüyoruz.
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
