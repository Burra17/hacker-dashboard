import type { TerminalCommand } from "@contracts/TerminalCommand";
import type { CommandResult } from "@contracts/CommandResult";
import { api } from "@/lib/api/axios";

const COMMAND_ENDPOINT = "/api/terminal/command";

/** POSTs a parsed command to the backend and returns its result. */
export async function sendCommand(
  command: TerminalCommand,
): Promise<CommandResult> {
  const { data } = await api.post<CommandResult>(COMMAND_ENDPOINT, command);
  return data;
}
