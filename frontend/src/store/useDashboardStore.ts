import { create } from "zustand";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import {
  createTerminalSlice,
  type TerminalSlice,
} from "@/store/slices/terminalSlice";
import {
  createStreamsSlice,
  type StreamsSlice,
} from "@/store/slices/streamsSlice";

/**
 * State boundary (hard line — keep it sharp):
 * This store holds CLIENT state only — UI (theme, panel toggles), terminal
 * (input + history), and SignalR-streamed data per channel.
 *
 * HTTP-fetched server data (weather, sports, calendar — polled) belongs to
 * TanStack Query, NOT here. Never copy Query data into Zustand or vice versa:
 * if it arrives over SignalR it lives in `streams`; if it's fetched over HTTP
 * it stays in the Query cache.
 */
export type DashboardStore = UiSlice & TerminalSlice & StreamsSlice;

export const useDashboardStore = create<DashboardStore>()((...a) => ({
  ...createUiSlice(...a),
  ...createTerminalSlice(...a),
  ...createStreamsSlice(...a),
}));
