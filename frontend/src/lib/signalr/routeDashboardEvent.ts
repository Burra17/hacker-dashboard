import type { DashboardEvent } from "@contracts/DashboardEvent";
import type { TerminalResponsePayload } from "@contracts/TerminalResponsePayload";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";

/**
 * The single entry point for every inbound DashboardEvent. AI prompt tokens on
 * `terminal.response` stream into the terminal history; otherwise snapshots reset a
 * channel (also applied on reconnect), deltas append, and heartbeats drive the live
 * indicator.
 */
export function routeDashboardEvent(event: DashboardEvent): void {
  const store = useDashboardStore.getState();

  if (event.channel === DASHBOARD_CHANNELS.terminalResponse) {
    const payload = event.payload as TerminalResponsePayload;
    if (payload.done) {
      store.endResponse();
    } else {
      store.appendResponseToken(payload.token);
    }
    return;
  }

  switch (event.type) {
    case "snapshot":
      store.resetChannel(event.channel, [event]);
      break;
    case "delta":
      store.pushEvent(event);
      break;
    case "heartbeat":
      store.markHeartbeat(event.timestamp);
      break;
    case "error":
      break;
  }
}
