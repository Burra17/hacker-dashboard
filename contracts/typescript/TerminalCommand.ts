/** A terminal line parsed into a verb and its arguments, sent to the backend over HTTP. */
export interface TerminalCommand {
  /** Exactly what the user typed — kept for terminal history. */
  raw: string;
  /** The action, e.g. "theme", "toggle", "prompt", "fetch". */
  verb: string;
  args: Record<string, string>;
}
