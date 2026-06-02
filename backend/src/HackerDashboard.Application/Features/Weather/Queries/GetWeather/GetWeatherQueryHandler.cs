using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Weather.Common.Dtos;
using HackerDashboard.Application.Interfaces.Services;

namespace HackerDashboard.Application.Features.Weather.Queries.GetWeather;

public sealed class GetWeatherQueryHandler(IWeatherProvider weatherProvider)
    : IQueryHandler<GetWeatherQuery, ErrorOr<WeatherDto>>
{
    public Task<ErrorOr<WeatherDto>> Handle(GetWeatherQuery request, CancellationToken cancellationToken) =>
        weatherProvider.GetCurrentAsync(cancellationToken);
}
