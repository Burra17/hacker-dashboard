using System.Text.Json;
using System.Text.Json.Serialization;
using HackerDashboard.API.Hubs;
using HackerDashboard.Application;
using HackerDashboard.Application.Features.Ping;
using HackerDashboard.Infrastructure;
using MediatR;

const string frontendCorsPolicy = "FrontendCors";
const string dashboardHubRoute = "/hubs/dashboard";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHealthChecks();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

// Restrict cross-origin access to the configured frontend origin(s). AllowCredentials is
// required for SignalR's WebSocket/credentialed transports, so origins must be explicit
// (it cannot be combined with AllowAnyOrigin).
string[] allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy(frontendCorsPolicy, policy =>
    policy.WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

// DashboardEvent.Type and other enums go over the wire as camelCase strings to match the
// shared TypeScript contracts (e.g. DashboardEventType.Snapshot -> "snapshot").
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(frontendCorsPolicy);

app.MapHealthChecks("/health");

app.MapHub<DashboardHub>(dashboardHubRoute);

// Smoke test for the MediatR pipeline (Issue 1.2). Replaced by real endpoints as features land.
app.MapGet("/ping", (ISender sender) => sender.Send(new PingQuery()));

app.Run();
