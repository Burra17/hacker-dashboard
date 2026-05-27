/**
 * Lifecycle of an event on a channel:
 * - snapshot: full current state, sent first on (re)connect
 * - delta: only what changed since the last event
 * - heartbeat: liveness ping; drives the live/offline indicator
 * - error: the producer failed to build a payload for this channel
 */
export type DashboardEventType = "snapshot" | "delta" | "heartbeat" | "error";

/** The single envelope for all server -> client data pushed over SignalR. */
export interface DashboardEvent<T = unknown> {
  /** GUID — used for dedup and as a stable React key. */
  eventId: string;
  /** Logical stream, e.g. "system.logs", "weather", "terminal.response". */
  channel: string;
  type: DashboardEventType;
  /** ISO 8601, UTC (server time). */
  timestamp: string;
  payload: T;
}
