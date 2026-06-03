/**
 * Single source of truth for the terminal's known verbs — drives both the `help`
 * listing and Tab-completion so they never drift from what actually runs.
 */
export interface CommandInfo {
  verb: string;
  summary: string;
}

export const COMMANDS: readonly CommandInfo[] = [
  { verb: "help", summary: "List the available commands." },
  { verb: "clear", summary: "Clear the terminal screen." },
  { verb: "theme", summary: "Switch the active theme: theme <name>." },
  { verb: "toggle", summary: "Show or hide a panel: toggle <panel>." },
  { verb: "logs", summary: "Fetch recent system log lines." },
  { verb: "prompt", summary: "Ask the AI; the answer streams back." },
];

export const COMMAND_VERBS: readonly string[] = COMMANDS.map((c) => c.verb);

/** Renders the `help` output: aligned columns of every verb and its summary. */
export function formatHelp(): string {
  const width = Math.max(...COMMANDS.map((c) => c.verb.length));
  const lines = COMMANDS.map(
    (c) => `  ${c.verb.padEnd(width)}  ${c.summary}`,
  );
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
