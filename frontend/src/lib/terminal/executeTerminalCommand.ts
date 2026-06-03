import type { CommandResult } from "@contracts/CommandResult";
import { parseCommand } from "@/lib/terminal/parseCommand";
import { isLocalCommand, runLocalCommand } from "@/lib/terminal/localCommands";
import { sendCommand } from "@/lib/terminal/sendCommand";

/**
 * Parses a raw terminal line and routes it: local verbs (theme/toggle/help/clear)
 * are resolved client-side; everything else is POSTed to the backend.
 */
export async function executeTerminalCommand(raw: string): Promise<CommandResult> {
  const command = parseCommand(raw);

  if (isLocalCommand(command.verb)) {
    return runLocalCommand(command);
  }

  return sendCommand(command);
}
