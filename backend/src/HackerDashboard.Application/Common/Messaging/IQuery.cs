using MediatR;

namespace HackerDashboard.Application.Common.Messaging;

/// <summary>A request that reads state and returns a response. Marker over MediatR's IRequest.</summary>
public interface IQuery<out TResponse> : IRequest<TResponse>;
