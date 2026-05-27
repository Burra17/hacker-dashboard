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

- **Zustand** holds client state only: UI (active theme, panel toggles), terminal (input + history), and SignalR-streamed data per channel.
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

Keep the TanStack/Zustand boundary documented in the store so it doesn't erode over time.

## Panels & Layout
- A fixed CSS Grid of terminal-style panels, flush against each other (Tiling WM feel).
- A reusable `<Panel>` component (title bar, border, content area) is the base for every panel.
- V1 panels: system logs, weather, sports, live ticker (top), terminal.
- The live ticker uses Framer Motion for a smooth, infinite stock-ticker scroll fed by Zustand stream data.

## Terminal
- Parses raw input into `{ verb, args }` (matching the `TerminalCommand` contract) and POSTs via Axios to the backend command endpoint.
- Renders `CommandResult.output` in history.
- Applies `sideEffect` to the Zustand `ui` slice directly — the backend never knows UI details (e.g. `theme nord` returns a `sideEffect`, the frontend owns what the theme looks like).
- AI/`prompt` commands stream their answer back over the SignalR `terminal.response` channel token-by-token — render tokens as they arrive, don't wait for a full blob.

## Conventions
- One component per file; filename matches the component.
- TypeScript everywhere — type props and the contract shapes; no `any`.
- Functional components + hooks. Co-locate component-specific hooks/types.
- Tailwind utility classes for styling; theme via the CSS variables, not hardcoded colors, so `theme` commands work.

## Tests
- Backend is the test-heavy side; frontend testing approach is not locked yet. If you add tests, prefer Vitest + React Testing Library (the modern default for Vite/Next) and keep them colocated. Ask before introducing a test framework so we set it up once, deliberately.

## Things to Avoid (frontend)
- ❌ Copying TanStack Query data into Zustand (or vice versa) — respect the boundary.
- ❌ A SignalR handler per panel — one central router by `channel`.
- ❌ Hardcoded colors — use the theme CSS variables.
- ❌ Blanking panels on disconnect — degrade gracefully with last-known values.
- ❌ Waiting for a full AI response — stream tokens from `terminal.response`.
