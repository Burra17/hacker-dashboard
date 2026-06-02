using ErrorOr;
using HackerDashboard.API.Extensions;
using HackerDashboard.Application.Features.Sports.Common.Dtos;
using HackerDashboard.Application.Features.Sports.Queries.GetSports;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HackerDashboard.API.Controllers;

[ApiController]
[Route("api/sports")]
public sealed class SportsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        ErrorOr<SportsDto> result = await sender.Send(new GetSportsQuery(), cancellationToken);
        return result.ToActionResult();
    }
}
