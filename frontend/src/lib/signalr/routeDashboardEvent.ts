import type { DashboardEvent } from "@contracts/DashboardEvent";
import { useDashboardStore } from "@/store/useDashboardStore";

/**
 * The single entry point for every inbound DashboardEvent. Snapshots reset a
 * channel (also applied on reconnect, when the hub re-sends them), deltas append,
 * and heartbeats drive the live indicator.
 */
export function routeDashboardEvent(event: DashboardEvent): void {
  const { pushEvent, resetChannel, markHeartbeat } =
    useDashboardStore.getState();

  switch (event.type) {
    case "snapshot":
      resetChannel(event.channel, [event]);
      break;
    case "delta":
      pushEvent(event);
      break;
    case "heartbeat":
      markHeartbeat(event.timestamp);
      break;
    case "error":
      break;
  }
}
