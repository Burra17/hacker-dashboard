import { describe, expect, it } from "vitest";
import { parseCommand } from "@/lib/terminal/parseCommand";

describe("parseCommand", () => {
  it("splits the verb from positional args", () => {
    const command = parseCommand("toggle weather");

    expect(command.verb).toBe("toggle");
    expect(command.args).toEqual({ "0": "weather" });
    expect(command.raw).toBe("toggle weather");
  });

  it("lowercases the verb but preserves the original raw input", () => {
    const command = parseCommand("THEME Synthwave");

    expect(command.verb).toBe("theme");
    expect(command.args).toEqual({ "0": "Synthwave" });
    expect(command.raw).toBe("THEME Synthwave");
  });

  it("collapses surrounding and repeated whitespace", () => {
    const command = parseCommand("  prompt   hello   world ");

    expect(command.verb).toBe("prompt");
    expect(command.args).toEqual({ "0": "hello", "1": "world" });
  });

  it("handles a bare verb with no args", () => {
    const command = parseCommand("help");

    expect(command.verb).toBe("help");
    expect(command.args).toEqual({});
  });
});
