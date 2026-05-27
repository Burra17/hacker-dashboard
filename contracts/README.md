# Shared Contracts

Single source of truth for the shapes that cross the backend ↔ frontend boundary.
Each contract is written **twice** — as a TypeScript interface (`typescript/`) and a
C# record (`csharp/`) — so neither side drifts.

## Contracts

| Contract | Purpose |
|---|---|
| `DashboardEvent<T>` | The one envelope for all server→client data over SignalR. |
| `SystemLogPayload` | A "system.logs" line; `delta` sends one, `snapshot` sends `SystemLogPayload[]`. |
| `HeartbeatPayload` | The "heartbeat" channel payload; arrival drives the live indicator. |
| `TerminalCommand` | A terminal line parsed into `verb` + `args`, sent over HTTP. |
| `CommandResult` | The backend's response to a command, echoed in the terminal. |

## Rules

- **Change both sides in the same PR.** If you touch a TS interface, update the C#
  record (and vice versa) before merging.
- These files are the canonical definitions. The backend mirrors `DashboardEvent`
  in its `Domain`/`Application` layer (Issue 1.3); the frontend imports the TS types.
- Enums (`DashboardEventType`, `CommandKind`) serialize to **camelCase string** wire
  values to match the TS string-literal unions. The backend configures
  `JsonStringEnumConverter` (camelCase) so e.g. `DashboardEventType.Snapshot` ⇄ `"snapshot"`.

## Wire notes

- `DashboardEvent.timestamp` is ISO 8601, UTC. C# `DateTimeOffset` serializes to this.
- `snapshot` is sent first on (re)connect with full state; `delta` carries only changes;
  `heartbeat` drives the live indicator.
- Payloads that can go stale carry their own `stale: boolean` flag (defined with the
  payload type, not on the envelope) so panels can dim instead of disappearing.
