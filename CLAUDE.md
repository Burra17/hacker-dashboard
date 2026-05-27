# CLAUDE.md

Context for Claude (and other AI assistants) working in the Hacker Dashboard monorepo. Read this before suggesting code, making changes, or creating files. This is the **root** file with shared conventions. See `backend/CLAUDE.md` and `frontend/CLAUDE.md` for stack-specific rules (loaded lazily when you work in those folders).

## Project Overview

Hacker Dashboard is a live dashboard with a "Tiling Window Manager" aesthetic: a grid of terminal-style panels showing real-time data (system logs, weather, sports), a scrolling live ticker, and an interactive terminal that acts as a command center. The terminal can control the UI (themes, panel toggles), fetch data on demand, and stream AI prompt responses token-by-token.

A **.NET 10 Web API** (Clean Architecture + CQRS) streams real-time data via **SignalR** to a **Next.js / TypeScript** frontend.

## Monorepo Layout

```
hacker-dashboard/
  backend/      → .NET 10 Web API (see backend/CLAUDE.md)
  frontend/     → Next.js + TypeScript (see frontend/CLAUDE.md)
  contracts/    → Shared data contracts (TypeScript + C#) — source of truth
  docs/         → plan.md and design docs
```

## Core Architecture Decisions (locked)

These are settled. Do not re-litigate them in code suggestions.

- **Shared envelope:** all server→client data over SignalR uses one `DashboardEvent<T>` envelope. The frontend has ONE central handler that routes by `channel` to the right state slice.
- **Commands go over HTTP** (Axios), request/response — **except** streaming AI responses, which push token-by-token over a dedicated SignalR channel `terminal.response`. This is the only place the request/response model is broken, on purpose.
- **Static channel subscriptions in V1.** The frontend knows its panels at startup and subscribes to fixed channels. Dynamic runtime subscription is a later phase — do not build a `Subscribe(channel)` hub method yet.
- **Strict state boundary (frontend):** Zustand = client state (UI, terminal history, SignalR-streamed data). TanStack Query = HTTP-fetched server data (polling). Never store the same data in both.

## Shared Contracts (`contracts/`)

The `contracts/` folder is the single source of truth for cross-boundary shapes, written as **both** TypeScript interfaces and C# records so neither side drifts.

```typescript
interface DashboardEvent<T = unknown> {
  eventId: string;     // GUID — dedup + React keys
  channel: string;     // "system.logs", "weather", "sports.allsvenskan", "terminal.response"...
  type: "snapshot" | "delta" | "heartbeat" | "error";
  timestamp: string;   // ISO 8601, UTC (server time)
  payload: T;
}

interface TerminalCommand {
  raw: string;                       // exactly what the user typed (for history)
  verb: string;                      // "theme", "toggle", "prompt", "fetch"...
  args: Record<string, string>;
}

interface CommandResult {
  success: boolean;
  kind: "ui" | "data" | "ai" | "system";
  output: string;                    // echoed in the terminal
  sideEffect?: { action: string; target?: string; value?: string };
}
```

- `type: snapshot` is sent first on (re)connect with full current state; `delta` carries only changes; `heartbeat` drives the live indicator and detects dead connections.
- Payloads that can be stale (e.g. weather when the upstream API is down) carry a `stale: boolean` flag so the panel can dim itself instead of disappearing (graceful degradation).
- When you change a contract, update **both** the TS and C# version in the same PR.

## Git Conventions

### Branches
- One branch per GitHub issue. Naming is flexible, but **link the branch/PR to its issue** so the issue auto-closes on merge and the Project board updates (e.g. reference `#12` in the PR, or use `Closes #12`).
- Suggested kebab-case prefixes: `feature/`, `fix/`, `refactor/`, `docs/`, `test/`.

### Commits — Conventional Commits
Format: `type(scope): description` in imperative mood.
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- Optional scope = area touched: `feat(hub): add heartbeat event`, `fix(terminal): handle empty input`, `chore(contracts): sync CommandResult to C#`.
- ✅ `feat(signalr): stream system logs over dashboard hub`
- ❌ `fixed stuff` / `wip`
- Small, focused commits.

### PRs
- All changes go through a PR to `main`. `main` is protected — no direct push.
- Reference the issue. Keep PRs scoped to one issue where possible.

### Project board
Columns: **Backlog → Todo → In Progress → In Review → Done**. An issue's card moves with the work:
- Starting it: create an issue-linked branch (`gh issue develop <n>`) and move the card to **In Progress**.
- Opening the PR (`Closes #<n>`): move the card to **In Review**.
- Merge: the card lands in **Done** and the issue auto-closes (built-in workflow). Only this last hop is automated; the earlier moves are manual.

## Code Quality Bar (applies everywhere)

The goal is high code quality with clear separation of responsibilities (SRP). Apply YAGNI — build what the current issue needs, not speculative abstractions.

- One class/component per file; filename matches the export.
- No magic numbers or strings — use named constants or enums.
- Comments explain **why**, not **what**. Prefer self-explanatory code over narration.
- Keep functions/methods small and focused; extract when they grow past one clear responsibility.
- Everything via dependency injection / props — no hidden global instantiation.

## Things to Avoid (cross-cutting)

- ❌ Storing the same data in both Zustand and TanStack Query — respect the boundary.
- ❌ Routing weather/sports/calendar through SignalR — those are HTTP polling via TanStack Query.
- ❌ Building dynamic channel subscription in V1 — subscriptions are static.
- ❌ Changing a contract on one side only — TS and C# move together.
- ❌ Adding "what" comments or speculative abstractions (YAGNI).

## Related Documents
- `docs/plan.md` — phased project plan and GitHub issues
- `contracts/` — shared data contracts (TS + C#)
- `backend/CLAUDE.md` — .NET stack, Clean Architecture, CQRS, testing rules
- `frontend/CLAUDE.md` — Next.js, state, SignalR client, panel conventions
