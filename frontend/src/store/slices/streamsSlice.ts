import type { StateCreator } from "zustand";
import type { DashboardEvent } from "@contracts/DashboardEvent";
import type { DashboardStore } from "@/store/useDashboardStore";

// Cap retained events per channel so a long-lived rolling feed (e.g. system.logs)
// stays bounded in memory instead of growing for the lifetime of the tab.
const MAX_EVENTS_PER_CHANNEL = 200;

export interface StreamsSlice {
  /** SignalR data keyed by channel (e.g. "system.logs"). */
  streams: Record<string, DashboardEvent[]>;
  /** Append a delta event to its channel. */
  pushEvent: (event: DashboardEvent) => void;
  /** Replace a channel's events wholesale — used for the connect-time snapshot. */
  resetChannel: (channel: string, events: DashboardEvent[]) => void;
}

export const createStreamsSlice: StateCreator<
  DashboardStore,
  [],
  [],
  StreamsSlice
> = (set) => ({
  streams: {},
  pushEvent: (event) =>
    set((state) => ({
      streams: {
        ...state.streams,
        [event.channel]: [...(state.streams[event.channel] ?? []), event].slice(
          -MAX_EVENTS_PER_CHANNEL,
        ),
      },
    })),
  resetChannel: (channel, events) =>
    set((state) => ({ streams: { ...state.streams, [channel]: events } })),
});
