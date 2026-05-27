using MediatR;

namespace HackerDashboard.Application.Common.Messaging;

/// <summary>Handles an <see cref="IQuery{TResponse}"/>.</summary>
public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, TResponse>
    where TQuery : IQuery<TResponse>;
