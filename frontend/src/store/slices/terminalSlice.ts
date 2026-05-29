import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export type TerminalLineKind = "command" | "output";

export interface TerminalLine {
  /** Stable React key. */
  id: string;
  /** `command` is the prompt-prefixed input echo; `output` is the backend's response. */
  kind: TerminalLineKind;
  text: string;
}

export interface TerminalSlice {
  input: string;
  /** Rendered terminal history, oldest first. */
  history: TerminalLine[];
  setInput: (input: string) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
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
  pushLine: (line) =>
    set((state) => ({
      history: [...state.history, { ...line, id: crypto.randomUUID() }],
    })),
  clearHistory: () => set({ history: [] }),
});
