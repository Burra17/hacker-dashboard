import type { DashboardEvent } from "@contracts/DashboardEvent";
import { useDashboardStore } from "@/store/useDashboardStore";

/**
 * The single entry point for every inbound DashboardEvent. Routes by event type
 * into the streams slice; heartbeat/error handling (live indicator, graceful
 * degradation) lands in Issue 3.3.
 */
export function routeDashboardEvent(event: DashboardEvent): void {
  const { pushEvent, resetChannel } = useDashboardStore.getState();

  switch (event.type) {
    case "snapshot":
      resetChannel(event.channel, [event]);
      break;
    case "delta":
      pushEvent(event);
      break;
    case "heartbeat":
    case "error":
      break;
  }
}
