import type { CommandSideEffect } from "@contracts/CommandResult";
import { useDashboardStore } from "@/store/useDashboardStore";
import { isPanelId, isThemeName } from "@/store/slices/uiSlice";

/**
 * Translates a backend-described side effect into a concrete `ui`-slice mutation.
 * The backend only names intent (`action` + `target`/`value`); the frontend owns
 * this vocabulary and what each change looks like. Unknown actions or malformed
 * values are ignored, so a future/mismatched backend action can't corrupt ui state.
 *
 * Action vocabulary (the backend's `ui` commands in Issue 4.3 must emit these):
 * - `setTheme`    — `value`  = theme name
 * - `togglePanel` — `target` = panel id
 */
export function applySideEffect(effect: CommandSideEffect): void {
  const { setTheme, togglePanel } = useDashboardStore.getState();

  switch (effect.action) {
    case "setTheme":
      if (isThemeName(effect.value)) setTheme(effect.value);
      break;
    case "togglePanel":
      if (isPanelId(effect.target)) togglePanel(effect.target);
      break;
  }
}
