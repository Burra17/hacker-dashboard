using MediatR;

namespace HackerDashboard.Application.Common.Messaging;

/// <summary>Handles an <see cref="ICommand{TResponse}"/>.</summary>
public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, TResponse>
    where TCommand : ICommand<TResponse>;

/// <summary>Handles a value-less <see cref="ICommand"/>.</summary>
public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand>
    where TCommand : ICommand;
