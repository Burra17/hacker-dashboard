# CLAUDE.md — Frontend

Next.js stack rules for `frontend/`. The root `CLAUDE.md` (shared conventions, contracts, git) also applies.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS — dark base tones + neon accents, monospace font, CSS variables for runtime theme switching
- Zustand — client state
- TanStack Query — HTTP-fetched server data (polling)
- `@microsoft/signalr` — real-time stream client
- Framer Motion — the live ticker animation
- Axios — terminal commands → backend
- **pnpm** as package manager

## State Boundary (the most important rule)

This is a deliberate, hard line — keep it sharp.

- **Zustand** holds client state only: UI (active theme, panel toggles), terminal (input + history), SignalR-streamed data per channel, and live-connection status.
- **TanStack Query** owns HTTP-fetched server data: weather, sports, calendar — polled (~every 5 min), with its own cache/refetch/stale handling.
- Never store the same data in both. If it arrives over SignalR → Zustand. If it's fetched over HTTP → TanStack Query. Don't copy Query data into Zustand.

## SignalR Client

- One singleton connection, created at app start, with `withAutomaticReconnect`.
- **One** central `.on` handler receives every `DashboardEvent` and routes by `channel` to the matching Zustand slice. Do not add a handler per panel.
- Drive a live/offline indicator from `heartbeat`. On reconnect, apply the `snapshot` then resume `delta`s.
- Graceful degradation: on disconnect or `stale: true` payloads, keep last-known values and dim the panel visually — never blank it out.

## Zustand Store — Slices

Separate slices, one responsibility each:
- `ui` — theme, panel visibility/toggles.
- `terminal` — current input, command history.
- `streams` — SignalR data keyed by channel.
- `connection` — live/offline status + last heartbeat (drives the live indicator).

Keep the TanStack/Zustand boundary documented in the store so it doesn't erode over time.

## Panels & Layout
- A fixed CSS Grid of terminal-style panels, flush against each other (Tiling WM feel).
- A reusable `<Panel>` component (title bar, border, content area) is the base for every panel.
- V1 panels: GitHub activity (commits/dev-log, left), weather, sports, live ticker (top), terminal. *(The mock system-logs SignalR stream still feeds the ticker until Issue 4.10 repoints it to live sport.)*
- The live ticker uses Framer Motion for a smooth, infinite stock-ticker scroll fed by Zustand stream data.

## Terminal
- Parses raw input into `{ verb, args }` (matching the `TerminalCommand` contract), then `executeTerminalCommand` **routes** it: local verbs are resolved entirely client-side by `runLocalCommand` — **no backend round-trip**; every other verb is POSTed via Axios to the command endpoint. Local verbs include UI (`theme`, `toggle` — validate against `THEME_NAMES`/`PANEL_IDS`, mutate the `ui` slice), terminal meta (`help` lists commands, `clear` empties the `terminal` slice history), and hidden easter eggs (`whoami`, `sudo`), each returning a `CommandResult` (or a friendly error).
- **One registry is the single source of truth** (`lib/terminal/commands.ts`): each `CommandDef` carries a `verb`, `summary`, optional `run` handler (present = client-side, absent = POST to backend), and optional `hidden` (easter eggs kept out of `help`/Tab-completion). To add a verb — frontend or backend — add one entry; `isLocalCommand`/`runLocalCommand`, the `help` listing, and `completeCommand` all derive from it, so nothing drifts.
- Renders `CommandResult.output` in history (local commands return the same `CommandResult` shape as backend ones), **color-coded** by `CommandResult.kind` (`ui`→accent, `data`→accent-2, `ai`→fg, `system`→muted) with failures forced to the error color — see `lineToneClass` (`lib/terminal/lineTone.ts`). Use the theme CSS-variable color classes, never hardcoded colors.
- Backend-returned `sideEffect`s are applied to the `ui` slice via `applySideEffect` — the backend names intent, the frontend owns what it looks like. `theme` reflects onto `<html data-theme>` via `ThemeSync`; `toggle` shows/hides panels in `DashboardGrid`.
- AI/`prompt` commands stream their answer back over the SignalR `terminal.response` channel token-by-token — render tokens as they arrive, don't wait for a full blob.

## Conventions
- One component per file; filename matches the component.
- TypeScript everywhere — type props and the contract shapes; no `any`.
- Reuse the shared contracts from `contracts/typescript` via the `@contracts/*` path alias as **type-only** imports (e.g. `import type { DashboardEvent } from "@contracts/DashboardEvent"`) — don't redefine contract shapes in the frontend.
- Functional components + hooks. Co-locate component-specific hooks/types.
- Tailwind utility classes for styling; theme via the CSS variables, not hardcoded colors, so `theme` commands work.

## Tests
- **Vitest + React Testing Library** (jsdom). Run with `pnpm test` (CI) or `pnpm test:watch`. Config: `vitest.config.mts` (React plugin + `vite-tsconfig-paths` so `@/` and `@contracts` resolve like in app code); global setup in `vitest.setup.ts` (jest-dom matchers, RTL auto-cleanup, a `scrollIntoView` stub jsdom lacks).
- Colocate tests next to the code: `*.test.ts(x)` beside the unit. Pure logic (e.g. `parseCommand`) and store mutations (e.g. `applySideEffect`) are unit-tested; components use RTL + `@testing-library/user-event`, mocking network modules (`vi.mock("@/lib/terminal/sendCommand")`).
- Backend is still the test-heavy side; cover meaningful frontend logic and component behavior, not snapshots.

## Things to Avoid (frontend)
- ❌ Copying TanStack Query data into Zustand (or vice versa) — respect the boundary.
- ❌ A SignalR handler per panel — one central router by `channel`.
- ❌ Hardcoded colors — use the theme CSS variables.
- ❌ Blanking panels on disconnect — degrade gracefully with last-known values.
- ❌ Waiting for a full AI response — stream tokens from `terminal.response`.
