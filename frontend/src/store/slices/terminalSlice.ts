import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export type TerminalLineKind = "command" | "output" | "response";

export interface TerminalLine {
  /** Stable React key. */
  id: string;
  /**
   * `command` is the prompt-prefixed input echo, `output` is a backend/local command result,
   * `response` is a streamed AI answer assembled from `terminal.response` tokens.
   */
  kind: TerminalLineKind;
  text: string;
  /** For `response` lines: true while tokens are still arriving. */
  streaming?: boolean;
}

export interface TerminalSlice {
  input: string;
  /** Rendered terminal history, oldest first. */
  history: TerminalLine[];
  setInput: (input: string) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
  /** Appends a streamed AI token to the open response line, or opens a new one. */
  appendResponseToken: (token: string) => void;
  /** Marks the open streaming response line as complete. */
  endResponse: () => void;
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
  appendResponseToken: (token) =>
    set((state) => {
      const last = state.history[state.history.length - 1];
      if (last?.kind === "response" && last.streaming) {
        const updated = { ...last, text: last.text + token };
        return { history: [...state.history.slice(0, -1), updated] };
      }
      return {
        history: [
          ...state.history,
          { id: crypto.randomUUID(), kind: "response", text: token, streaming: true },
        ],
      };
    }),
  endResponse: () =>
    set((state) => {
      const last = state.history[state.history.length - 1];
      if (last?.kind === "response" && last.streaming) {
        return { history: [...state.history.slice(0, -1), { ...last, streaming: false }] };
      }
      return {};
    }),
  clearHistory: () => set({ history: [] }),
});
