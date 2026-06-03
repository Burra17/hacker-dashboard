import type { CommandKind } from "@contracts/CommandResult";
import type { TerminalLine } from "@/store/slices/terminalSlice";

/** Per-kind text color (theme CSS variables) for successful command output. */
const KIND_TONE: Record<CommandKind, string> = {
  ui: "text-accent",
  data: "text-accent-2",
  ai: "text-fg",
  system: "text-muted",
};

const ERROR_TONE = "text-error";
const RESPONSE_TONE = "text-fg";
const FALLBACK_TONE = "text-muted";

/**
 * The Tailwind text-color class for a rendered line: failures are always the
 * error color; otherwise output is colored by its `CommandResult.kind`, and
 * streamed AI responses read as primary text.
 */
export function lineToneClass(line: TerminalLine): string {
  if (line.kind === "response") return RESPONSE_TONE;
  if (line.success === false) return ERROR_TONE;
  if (line.outputKind) return KIND_TONE[line.outputKind];
  return FALLBACK_TONE;
}
