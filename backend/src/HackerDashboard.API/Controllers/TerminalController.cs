using ErrorOr;
using HackerDashboard.API.Extensions;
using HackerDashboard.Application.Features.Terminal.Commands.ExecuteCommand;
using HackerDashboard.Application.Features.Terminal.Common.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HackerDashboard.API.Controllers;

[ApiController]
[Route("api/terminal")]
public sealed class TerminalController(ISender sender) : ControllerBase
{
    [HttpPost("command")]
    public async Task<IActionResult> Execute([FromBody] TerminalCommand command, CancellationToken cancellationToken)
    {
        ErrorOr<CommandResult> result = await sender.Send(new ExecuteCommandCommand(command), cancellationToken);
        return result.ToActionResult();
    }
}
