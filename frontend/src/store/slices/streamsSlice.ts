import type { StateCreator } from "zustand";
import type { DashboardEvent } from "@contracts/DashboardEvent";
import type { DashboardStore } from "@/store/useDashboardStore";

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
        [event.channel]: [...(state.streams[event.channel] ?? []), event],
      },
    })),
  resetChannel: (channel, events) =>
    set((state) => ({ streams: { ...state.streams, [channel]: events } })),
});
