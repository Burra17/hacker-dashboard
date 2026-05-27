using MediatR;

namespace HackerDashboard.Application.Common.Messaging;

/// <summary>A request that changes state and returns a response. Marker over MediatR's IRequest.</summary>
public interface ICommand<out TResponse> : IRequest<TResponse>;

/// <summary>A request that changes state without returning a value.</summary>
public interface ICommand : IRequest;
