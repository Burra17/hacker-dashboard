using ErrorOr;
using FluentValidation;
using MediatR;

namespace HackerDashboard.Application.Common.Behaviours;

/// <summary>
/// Runs FluentValidation validators before a request reaches its handler. On failure it
/// short-circuits the pipeline with <see cref="Error.Validation"/> errors instead of letting
/// invalid input through. Only applies to handlers whose response is an <see cref="IErrorOr"/>.
/// </summary>
public sealed class ValidationBehaviour<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    where TResponse : IErrorOr
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);
        List<Error> errors = validators
            .Select(validator => validator.Validate(context))
            .SelectMany(result => result.Errors)
            .Where(failure => failure is not null)
            .Select(failure => Error.Validation(failure.PropertyName, failure.ErrorMessage))
            .ToList();

        if (errors.Count == 0)
        {
            return await next();
        }

        // ErrorOr<T> defines an implicit conversion from List<Error>; dynamic dispatch binds it
        // at runtime since TResponse is always a concrete ErrorOr<T> here.
        return (dynamic)errors;
    }
}
