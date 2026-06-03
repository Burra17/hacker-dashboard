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
 * One registry entry per known verb — the single place a command is declared.
 * `run` present means the verb is resolved entirely client-side; absent means it
 * is POSTed to the backend. `hidden` keeps a verb out of `help`/Tab-completion
 * (easter eggs). To add a command, add an entry here — nothing else to wire.
 */
export interface CommandDef {
  verb: string;
  summary: string;
  run?: (command: TerminalCommand) => CommandResult;
  hidden?: boolean;
}

const ui = (success: boolean, output: string): CommandResult => ({
  success,
  kind: "ui",
  output,
});

const system = (output: string, success = true): CommandResult => ({
  success,
  kind: "system",
  output,
});

function runTheme(command: TerminalCommand): CommandResult {
  const arg = command.args["0"];
  if (!arg) return ui(false, `usage: theme <name> (${THEME_NAMES.join(", ")})`);
  if (!isThemeName(arg)) {
    return ui(false, `unknown theme '${arg}' (${THEME_NAMES.join(", ")})`);
  }
  useDashboardStore.getState().setTheme(arg);
  return ui(true, `theme → ${arg}`);
}

function runToggle(command: TerminalCommand): CommandResult {
  const arg = command.args["0"];
  if (!arg) return ui(false, `usage: toggle <panel> (${PANEL_IDS.join(", ")})`);
  if (!isPanelId(arg)) {
    return ui(false, `unknown panel '${arg}' (${PANEL_IDS.join(", ")})`);
  }
  if (arg === "terminal") {
    return ui(false, "Error: Cannot hide primary control terminal");
  }
  useDashboardStore.getState().togglePanel(arg);
  return ui(
    true,
    `${arg} ${useDashboardStore.getState().panels[arg] ? "shown" : "hidden"}`,
  );
}

export const COMMANDS: readonly CommandDef[] = [
  { verb: "help", summary: "List the available commands.", run: () => system(formatHelp()) },
  {
    verb: "clear",
    summary: "Clear the terminal screen.",
    // Empty output so the freshly cleared screen stays empty.
    run: () => {
      useDashboardStore.getState().clearHistory();
      return system("");
    },
  },
  { verb: "theme", summary: "Switch the active theme: theme <name>.", run: runTheme },
  { verb: "toggle", summary: "Show or hide a panel: toggle <panel>.", run: runToggle },
  { verb: "logs", summary: "Fetch recent system log lines." },
  { verb: "prompt", summary: "Ask the AI; the answer streams back." },
  // Easter eggs — hidden from help/completion, but they still run.
  {
    verb: "whoami",
    summary: "Who are you, really?",
    hidden: true,
    run: () => system("r00t — elite hacker mode engaged (you wish, guest)."),
  },
  {
    verb: "sudo",
    summary: "Make me a sandwich.",
    hidden: true,
    run: () =>
      system(
        "sudo: a dashboard is no place for root. this incident has been reported.",
        false,
      ),
  },
];

const BY_VERB = new Map(COMMANDS.map((c) => [c.verb, c]));

/** Looks up a registered command (including hidden ones), or undefined. */
export const findCommand = (verb: string): CommandDef | undefined => BY_VERB.get(verb);

/** Verbs surfaced to the user — drives `help` and Tab-completion (no easter eggs). */
export const COMMAND_VERBS: readonly string[] = COMMANDS.filter(
  (c) => !c.hidden,
).map((c) => c.verb);

/** Renders the `help` output: aligned columns of every visible verb and its summary. */
export function formatHelp(): string {
  const visible = COMMANDS.filter((c) => !c.hidden);
  const width = Math.max(...visible.map((c) => c.verb.length));
  const lines = visible.map((c) => `  ${c.verb.padEnd(width)}  ${c.summary}`);
  return ["available commands:", ...lines].join("\n");
}

/**
 * Tab-completion: returns the single verb that completes `input`, or null when
 * the input is empty, already past the verb (contains a space), or matches zero
 * or several verbs (ambiguous — nothing to commit to).
 */
export function completeCommand(input: string): string | null {
  if (input === "" || input.includes(" ")) return null;

  const matches = COMMAND_VERBS.filter(
    (verb) => verb.startsWith(input) && verb !== input,
  );
  return matches.length === 1 ? matches[0] : null;
}
