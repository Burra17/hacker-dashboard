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
  /** Submitted raw commands for up/down recall, oldest first (distinct from `history`). */
  commandHistory: string[];
  /** `null` = live input line; otherwise the index into `commandHistory` being recalled. */
  historyCursor: number | null;
  setInput: (input: string) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
  /** Records a submitted command for recall (skips blanks and consecutive duplicates). */
  pushCommand: (raw: string) => void;
  /** Up arrow: recall an older command into the input. */
  recallPrevious: () => void;
  /** Down arrow: recall a newer command, or return to a fresh prompt line. */
  recallNext: () => void;
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
  commandHistory: [],
  historyCursor: null,
  // Typing leaves history navigation, so the next Up arrow starts from the newest command.
  setInput: (input) => set({ input, historyCursor: null }),
  pushLine: (line) =>
    set((state) => ({
      history: [...state.history, { ...line, id: crypto.randomUUID() }],
    })),
  pushCommand: (raw) =>
    set((state) => {
      const command = raw.trim();
      const last = state.commandHistory[state.commandHistory.length - 1];
      if (command === "" || command === last) {
        return { historyCursor: null };
      }
      return {
        commandHistory: [...state.commandHistory, command],
        historyCursor: null,
      };
    }),
  recallPrevious: () =>
    set((state) => {
      const { commandHistory, historyCursor } = state;
      if (commandHistory.length === 0) return {};
      const cursor =
        historyCursor === null
          ? commandHistory.length - 1
          : Math.max(0, historyCursor - 1);
      return { input: commandHistory[cursor], historyCursor: cursor };
    }),
  recallNext: () =>
    set((state) => {
      const { commandHistory, historyCursor } = state;
      if (historyCursor === null) return {};
      if (historyCursor < commandHistory.length - 1) {
        const cursor = historyCursor + 1;
        return { input: commandHistory[cursor], historyCursor: cursor };
      }
      // Past the newest entry: back to a blank, live prompt line.
      return { input: "", historyCursor: null };
    }),
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
