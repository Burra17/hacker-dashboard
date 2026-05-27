using HackerDashboard.Application;
using HackerDashboard.Application.Features.Ping;
using HackerDashboard.Infrastructure;
using MediatR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHealthChecks();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapHealthChecks("/health");

// Smoke test for the MediatR pipeline (Issue 1.2). Replaced by real endpoints as features land.
app.MapGet("/ping", (ISender sender) => sender.Send(new PingQuery()));

app.Run();
