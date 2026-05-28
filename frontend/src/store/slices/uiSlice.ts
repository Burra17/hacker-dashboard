import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export type ThemeName = "matrix" | "synthwave";

export type PanelId = "ticker" | "system.logs" | "weather" | "sports" | "terminal";

const ALL_PANELS_VISIBLE: Record<PanelId, boolean> = {
  ticker: true,
  "system.logs": true,
  weather: true,
  sports: true,
  terminal: true,
};

export interface UiSlice {
  theme: ThemeName;
  /** Per-panel visibility; true = shown. Driven by the `toggle` command later. */
  panels: Record<PanelId, boolean>;
  setTheme: (theme: ThemeName) => void;
  togglePanel: (id: PanelId) => void;
}

export const createUiSlice: StateCreator<DashboardStore, [], [], UiSlice> = (
  set,
) => ({
  theme: "matrix",
  panels: { ...ALL_PANELS_VISIBLE },
  setTheme: (theme) => set({ theme }),
  togglePanel: (id) =>
    set((state) => ({ panels: { ...state.panels, [id]: !state.panels[id] } })),
});
