import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export interface TerminalSlice {
  input: string;
  /** Rendered command/echo history, oldest first. */
  history: string[];
  setInput: (input: string) => void;
  pushHistory: (line: string) => void;
  clearHistory: () => void;
}

export const createTerminalSlice: StateCreator<
  DashboardStore,
  [],
  [],
  TerminalSlice
> = (set) => ({
  input: "",
  history: [],
  setInput: (input) => set({ input }),
  pushHistory: (line) => set((state) => ({ history: [...state.history, line] })),
  clearHistory: () => set({ history: [] }),
});
