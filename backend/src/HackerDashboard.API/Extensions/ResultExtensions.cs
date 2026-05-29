using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace HackerDashboard.API.Extensions;

/// <summary>
/// Maps an <see cref="ErrorOr{T}"/> handler result onto an HTTP response so controllers stay thin:
/// success returns the value, expected errors map to the matching status code via a problem payload.
/// </summary>
public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this ErrorOr<T> result)
    {
        if (!result.IsError)
        {
            return new OkObjectResult(result.Value);
        }

        Error firstError = result.Errors[0];
        int statusCode = firstError.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = firstError.Description
        };
        problem.Extensions["errors"] = result.Errors
            .Select(error => new { error.Code, error.Description })
            .ToArray();

        return new ObjectResult(problem) { StatusCode = statusCode };
    }
}
