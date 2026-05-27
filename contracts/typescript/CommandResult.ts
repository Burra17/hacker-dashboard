/** Which subsystem produced the result — lets the terminal route the output. */
export type CommandKind = "ui" | "data" | "ai" | "system";

/**
 * An instruction for the frontend to mutate its own state (e.g. switch theme).
 * The backend describes the intent; the frontend owns what it looks like.
 */
export interface CommandSideEffect {
  action: string;
  target?: string;
  value?: string;
}

/** The backend's response to a TerminalCommand, echoed in the terminal. */
export interface CommandResult {
  success: boolean;
  kind: CommandKind;
  /** Text rendered in the terminal history. */
  output: string;
  sideEffect?: CommandSideEffect;
}
