import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export type ConnectionStatus =
  | "connecting"
  | "online"
  | "reconnecting"
  | "offline";

export interface ConnectionSlice {
  status: ConnectionStatus;
  /** Server timestamp of the last heartbeat — used to detect a dead connection. */
  lastHeartbeatAt: string | null;
  setStatus: (status: ConnectionStatus) => void;
  markHeartbeat: (timestamp: string) => void;
}

export const createConnectionSlice: StateCreator<
  DashboardStore,
  [],
  [],
  ConnectionSlice
> = (set) => ({
  status: "connecting",
  lastHeartbeatAt: null,
  setStatus: (status) => set({ status }),
  markHeartbeat: (timestamp) =>
    set({ status: "online", lastHeartbeatAt: timestamp }),
});
