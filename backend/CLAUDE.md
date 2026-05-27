# CLAUDE.md — Backend

.NET stack rules for `backend/`. The root `CLAUDE.md` (shared conventions, contracts, git) also applies.

## Tech Stack
- .NET 10 (Web API)
- MediatR for CQRS
- SignalR for real-time server→client streaming
- ErrorOr for the Result pattern (expected application errors)
- FluentValidation for input validation
- AutoMapper for entity/DTO mapping
- Repository pattern over the data source
- NUnit + NSubstitute for tests

Use the Result pattern, repositories, and AutoMapper where they earn their place — this project reads and streams more than it persists, so don't force persistence ceremony onto endpoints that just shape data.

## Architecture — Clean Architecture

Four projects. Dependencies always point inward.

```
HackerDashboard.API            → Application, Infrastructure
HackerDashboard.Infrastructure → Application, Domain
HackerDashboard.Application    → Domain
HackerDashboard.Domain         → (no dependencies)
```

### Solution Layout
Production projects under `src/`, tests at repo (backend) root.

```
backend/
  src/
    HackerDashboard.API/
    HackerDashboard.Application/
    HackerDashboard.Infrastructure/
    HackerDashboard.Domain/
  HackerDashboard.Tests/
```

- **Domain** — entities, value objects, enums, domain logic. Pure C#, zero external packages. The `DashboardEvent` envelope shape lives here (or in Application) so both the hub and handlers share it.
- **Application** — CQRS commands/queries via MediatR, handlers, DTOs, interfaces (repositories + external services), FluentValidation validators, AutoMapper profiles, pipeline behaviours. Feature-scoped under `Features/{Area}/`.
- **Infrastructure** — repository implementations, external API clients (weather, sports), `BackgroundService` data producers, strongly-typed settings, DI wiring.
- **API** — thin controllers (dispatch via MediatR), the SignalR `DashboardHub`, middleware, `Program.cs`, DI composition.

## SignalR

- The `DashboardHub` lives in the API layer. Producers (`BackgroundService`s in Infrastructure) push `DashboardEvent<T>` to clients via `IHubContext<DashboardHub>`.
- On client (re)connect: send a `snapshot`, then `delta`s. Emit a `heartbeat` on a timer.
- Channels are fixed in V1 (`system.logs`, `terminal.response`, ...). Do not add a dynamic `Subscribe` method.
- Streaming AI responses go out on `terminal.response`, token-by-token.

## Application Layer Structure — CQRS

One folder per feature; one command/query per folder. Filenames and class names carry the full `Command`/`Query` suffix so the kind is obvious at a glance.

```
HackerDashboard.Application/
  Features/
    Terminal/
      Commands/
        ExecuteCommand/
          ExecuteCommandCommand.cs
          ExecuteCommandCommandHandler.cs
          ExecuteCommandCommandValidator.cs
      Common/
        Dtos/        Errors/        Mappings/
  Common/
    Behaviours/ (ValidationBehaviour, LoggingBehaviour)
  Interfaces/
    Repositories/    Services/
  DependencyInjection.cs
```

### Naming
| Concern | Pattern | Example |
|---|---|---|
| Command | `{Verb}{Entity}Command` | `ExecuteCommandCommand` |
| Query | `{Verb}{Entity}Query` | `GetWeatherQuery` |
| Handler | `{RequestName}Handler` | `ExecuteCommandCommandHandler` |
| Validator | `{RequestName}Validator` | `ExecuteCommandCommandValidator` |
| DTO | `{Entity}Dto` / `{Verb}{Entity}Response` | `WeatherDto` |
| Errors | `{Entity}Errors` (static) | `TerminalErrors` |

- Handlers/validators keep the full suffix — never shorten to `...Handler` without `Command`/`Query`.
- Folder name = request name without suffix.
- DTOs per-feature under `Features/{Area}/Common/Dtos/`, not a global folder.
- AutoMapper profiles live next to their feature and are auto-discovered.

## Conventions
- PascalCase for types/methods/properties; `_camelCase` private fields; camelCase locals/params; `IPascalCase` interfaces.
- Async methods always suffixed `Async`.

## CQRS & Error Handling
- Commands change state, queries read — never mix.
- Handlers return `ErrorOr<T>`. Use ErrorOr for expected failures (validation, not found, conflict, forbidden) — do **not** throw custom exceptions for normal flow.
- Define reusable errors as static `Error` properties per area (e.g. `TerminalErrors.UnknownVerb`).
- Queries return DTOs, never entities.
- Controllers stay thin: dispatch via MediatR, map `ErrorOr<T>` to `IActionResult` via a shared `ResultExtensions.ToActionResult(this)`.
- Validation → `Error.Validation` → 400; Unauthorized → 401; Forbidden → 403; NotFound → 404; Conflict → 409; unmapped → 500.
- Centralized exception middleware handles only unexpected exceptions. Use try/catch sparingly — let surprises bubble to middleware.

## Repositories
- Generic `IGenericRepository<T>` for CRUD (open generic in Infra DI); specific repos for entity-specific queries.
- Repositories return entities, never DTOs. All data-access logic lives in repositories, never in handlers.

## Tests — NUnit (high coverage expected)

The backend should have **strong test coverage** — prioritise it.

- NUnit + NSubstitute. Focus on Application handlers, plus targeted Infrastructure services.
- Naming: `MethodName_Scenario_ExpectedResult` (e.g. `Handle_UnknownVerb_ReturnsError`).
- AAA pattern, `Assert.That(...)` (NUnit 4 style). `[SetUp]` per test, `[OneTimeSetUp]` for one-time.
- Mock fields named `_xxxMock`. Mock all external services — never hit a real API or DB.
- Tests independent and order-agnostic.

## Dependency Injection
- Each of Application and Infrastructure owns a `DependencyInjection.cs` extension method. `Program.cs` only calls `AddApplication()` / `AddInfrastructure(config)`. Never register services directly in `Program.cs`.

## Common Commands
- Run API: `dotnet run --project src/HackerDashboard.API`
- Run tests: `dotnet test`
- Secrets (e.g. external API keys): `dotnet user-secrets` — never hardcode or commit keys.

## Things to Avoid (backend)
- ❌ Business logic in controllers — it belongs in handlers.
- ❌ Returning entities from the API — always DTOs.
- ❌ Calling the data context directly from handlers — go through repositories.
- ❌ Custom exceptions for normal flow — use ErrorOr.
- ❌ Registering services in `Program.cs` — use `DependencyInjection.cs`.
- ❌ A dynamic SignalR `Subscribe` method — channels are static in V1.
- ❌ Hardcoded config/secrets — use appsettings/user-secrets.
