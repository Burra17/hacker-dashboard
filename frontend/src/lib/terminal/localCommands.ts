import type { CommandResult } from "@contracts/CommandResult";
import type { TerminalCommand } from "@contracts/TerminalCommand";
import { findCommand } from "@/lib/terminal/commands";

/**
 * A verb is "local" when its registry entry carries a `run` handler — resolved
 * entirely client-side (UI changes, terminal meta-commands, easter eggs).
 * Everything else is POSTed to the backend command endpoint.
 */
export const isLocalCommand = (verb: string): boolean =>
  findCommand(verb)?.run !== undefined;

/**
 * Runs a local command via its registry handler. Callers must check
 * {@link isLocalCommand} first; a missing handler is a programmer error.
 */
export function runLocalCommand(command: TerminalCommand): CommandResult {
  const run = findCommand(command.verb)?.run;
  if (!run) throw new Error(`not a local command: ${command.verb}`);
  return run(command);
}
