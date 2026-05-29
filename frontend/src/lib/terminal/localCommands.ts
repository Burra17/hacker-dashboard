import type { CommandResult } from "@contracts/CommandResult";
import type { TerminalCommand } from "@contracts/TerminalCommand";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  PANEL_IDS,
  THEME_NAMES,
  isPanelId,
  isThemeName,
} from "@/store/slices/uiSlice";

/**
 * Verbs the frontend resolves entirely client-side — pure UI changes that don't
 * need the server. Everything else is POSTed to the backend command endpoint.
 */
const LOCAL_VERBS = ["theme", "toggle"] as const;
type LocalVerb = (typeof LOCAL_VERBS)[number];

export const isLocalCommand = (verb: string): verb is LocalVerb =>
  (LOCAL_VERBS as readonly string[]).includes(verb);

const uiResult = (success: boolean, output: string): CommandResult => ({
  success,
  kind: "ui",
  output,
});

/**
 * Interprets a local UI command, validating its argument and mutating the `ui`
 * slice directly. Unknown values produce a friendly, listing error instead of
 * silently doing nothing. Callers must check {@link isLocalCommand} first.
 */
export function runLocalUiCommand(command: TerminalCommand): CommandResult {
  const { setTheme, togglePanel } = useDashboardStore.getState();
  const arg = command.args["0"];

  switch (command.verb as LocalVerb) {
    case "theme":
      if (!arg) return uiResult(false, `usage: theme <name> (${THEME_NAMES.join(", ")})`);
      if (!isThemeName(arg)) {
        return uiResult(false, `unknown theme '${arg}' (${THEME_NAMES.join(", ")})`);
      }
      setTheme(arg);
      return uiResult(true, `theme → ${arg}`);

    case "toggle":
      if (!arg) return uiResult(false, `usage: toggle <panel> (${PANEL_IDS.join(", ")})`);
      if (!isPanelId(arg)) {
        return uiResult(false, `unknown panel '${arg}' (${PANEL_IDS.join(", ")})`);
      }
      if (arg === "terminal") {
        return uiResult(false, "Error: Cannot hide primary control terminal");
      }
      togglePanel(arg);
      return uiResult(
        true,
        `${arg} ${useDashboardStore.getState().panels[arg] ? "shown" : "hidden"}`,
      );
  }
}
