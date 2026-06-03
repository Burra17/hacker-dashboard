import type { StateCreator } from "zustand";
import type { DashboardStore } from "@/store/useDashboardStore";

export const THEME_NAMES = ["matrix", "synthwave"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export const PANEL_IDS = [
  "ticker",
  "commits",
  "weather",
  "sports",
  "logs",
  "terminal",
] as const;
export type PanelId = (typeof PANEL_IDS)[number];

export const isThemeName = (value: string | undefined): value is ThemeName =>
  value !== undefined && (THEME_NAMES as readonly string[]).includes(value);

export const isPanelId = (value: string | undefined): value is PanelId =>
  value !== undefined && (PANEL_IDS as readonly string[]).includes(value);

const ALL_PANELS_VISIBLE = Object.fromEntries(
  PANEL_IDS.map((id) => [id, true]),
) as Record<PanelId, boolean>;

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
