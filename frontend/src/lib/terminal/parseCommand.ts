import type { TerminalCommand } from "@contracts/TerminalCommand";

/**
 * Parses a raw terminal line into the {@link TerminalCommand} contract.
 *
 * The first whitespace-delimited token is the (lowercased) `verb`; the rest are
 * positional args keyed by their index as strings ("0", "1", ...), since the
 * parser is verb-agnostic and can't assign semantic names. Free-text verbs
 * (e.g. `prompt`) should read the preserved `raw` instead of the split args.
 */
export function parseCommand(raw: string): TerminalCommand {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const [verb = "", ...rest] = tokens;

  const args: Record<string, string> = {};
  rest.forEach((token, index) => {
    args[String(index)] = token;
  });

  return { raw, verb: verb.toLowerCase(), args };
}
