using ErrorOr;
using HackerDashboard.API.Extensions;
using HackerDashboard.Application.Features.Weather.Common.Dtos;
using HackerDashboard.Application.Features.Weather.Queries.GetWeather;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HackerDashboard.API.Controllers;

[ApiController]
[Route("api/weather")]
public sealed class WeatherController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        ErrorOr<WeatherDto> result = await sender.Send(new GetWeatherQuery(), cancellationToken);
        return result.ToActionResult();
    }
}
