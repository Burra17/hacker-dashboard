# Hacker Dashboard

A live dashboard with a "Tiling Window Manager" aesthetic: a grid of terminal-style panels
showing real-time data (system logs, weather, sports), a scrolling live ticker, and an
interactive terminal that acts as a command center.

A **.NET 10 Web API** (Clean Architecture + CQRS) streams real-time data over **SignalR** to a
**Next.js / TypeScript** frontend.

## Monorepo layout

```
hacker-dashboard/
  backend/      .NET 10 Web API (Clean Architecture, CQRS, SignalR)
  frontend/     Next.js + TypeScript (not scaffolded yet — Phase 2)
  contracts/    Shared data contracts (TypeScript + C#) — source of truth
  docs/         plan.md and design docs
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/)
- Node.js + [pnpm](https://pnpm.io/) (for the frontend, once scaffolded)

## Running the backend

```bash
cd backend
dotnet build HackerDashboard.slnx
dotnet run --project src/HackerDashboard.API --launch-profile http
```

The API listens on `http://localhost:5076`:

- `GET /health` — health check (returns `Healthy`)
- `GET /ping` — temporary MediatR smoke test (replaced as features land)

## Running the frontend

Not scaffolded yet — see Phase 2 in [`docs/plan.md`](docs/plan.md).

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — architecture decisions, shared contracts, git conventions
- [`backend/CLAUDE.md`](backend/CLAUDE.md) — .NET stack, Clean Architecture, CQRS, testing
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — Next.js, state, SignalR client, panels
- [`docs/plan.md`](docs/plan.md) — phased project plan and GitHub issues
