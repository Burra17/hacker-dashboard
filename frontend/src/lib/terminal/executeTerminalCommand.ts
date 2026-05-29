import type { CommandResult } from "@contracts/CommandResult";
import { parseCommand } from "@/lib/terminal/parseCommand";
import { isLocalCommand, runLocalUiCommand } from "@/lib/terminal/localCommands";
import { sendCommand } from "@/lib/terminal/sendCommand";

/**
 * Parses a raw terminal line and routes it: pure-UI verbs (theme/toggle) are
 * resolved client-side; everything else is POSTed to the backend.
 */
export async function executeTerminalCommand(raw: string): Promise<CommandResult> {
  const command = parseCommand(raw);

  if (isLocalCommand(command.verb)) {
    return runLocalUiCommand(command);
  }

  return sendCommand(command);
}
