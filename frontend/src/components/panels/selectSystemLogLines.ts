import type { DashboardEvent } from "@contracts/DashboardEvent";
import type { SystemLogPayload } from "@contracts/SystemLogPayload";

export interface SystemLogLine extends SystemLogPayload {
  /** Stable React key — eventId for deltas, eventId+index for snapshot lines. */
  key: string;
  timestamp: string;
}

/**
 * Flatten the raw channel events into renderable lines: a snapshot carries the
 * recent history (SystemLogPayload[]), each delta carries one line.
 */
export function selectSystemLogLines(
  events: DashboardEvent[] | undefined,
): SystemLogLine[] {
  if (!events) return [];

  const lines: SystemLogLine[] = [];
  for (const event of events) {
    if (event.type === "snapshot") {
      const payload = event.payload as SystemLogPayload[];
      payload.forEach((entry, index) =>
        lines.push({ ...entry, key: `${event.eventId}-${index}`, timestamp: event.timestamp }),
      );
    } else if (event.type === "delta") {
      const entry = event.payload as SystemLogPayload;
      lines.push({ ...entry, key: event.eventId, timestamp: event.timestamp });
    }
  }
  return lines;
}
