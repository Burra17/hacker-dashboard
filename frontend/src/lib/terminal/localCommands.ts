import type { CommandResult } from "@contracts/CommandResult";
import type { TerminalCommand } from "@contracts/TerminalCommand";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  PANEL_IDS,
  THEME_NAMES,
  isPanelId,
  isThemeName,
} from "@/store/slices/uiSlice";
import { formatHelp } from "@/lib/terminal/commands";

/**
 * Verbs the frontend resolves entirely client-side — UI changes (theme/toggle)
 * and terminal meta-commands (help/clear) that don't need the server. Everything
 * else is POSTed to the backend command endpoint.
 */
const LOCAL_VERBS = ["theme", "toggle", "help", "clear"] as const;
type LocalVerb = (typeof LOCAL_VERBS)[number];

export const isLocalCommand = (verb: string): verb is LocalVerb =>
  (LOCAL_VERBS as readonly string[]).includes(verb);

const uiResult = (success: boolean, output: string): CommandResult => ({
  success,
  kind: "ui",
  output,
});

const systemResult = (output: string): CommandResult => ({
  success: true,
  kind: "system",
  output,
});

/**
 * Interprets a local command, mutating client state directly. UI verbs validate
 * their argument against the `ui` slice; meta verbs touch the `terminal` slice.
 * Unknown argument values produce a friendly, listing error instead of silently
 * doing nothing. Callers must check {@link isLocalCommand} first.
 */
export function runLocalCommand(command: TerminalCommand): CommandResult {
  const { setTheme, togglePanel, clearHistory } = useDashboardStore.getState();
  const arg = command.args["0"];

  switch (command.verb as LocalVerb) {
    case "help":
      return systemResult(formatHelp());

    case "clear":
      // Empty output so the freshly cleared screen stays empty.
      clearHistory();
      return systemResult("");

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
