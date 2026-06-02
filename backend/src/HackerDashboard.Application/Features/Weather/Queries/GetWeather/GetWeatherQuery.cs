using ErrorOr;
using HackerDashboard.Application.Common.Messaging;
using HackerDashboard.Application.Features.Weather.Common.Dtos;

namespace HackerDashboard.Application.Features.Weather.Queries.GetWeather;

/// <summary>Fetches the current weather for the configured location on demand.</summary>
public sealed record GetWeatherQuery : IQuery<ErrorOr<WeatherDto>>;
