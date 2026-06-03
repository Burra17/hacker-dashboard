import { describe, expect, it } from "vitest";
import {
  COMMAND_VERBS,
  completeCommand,
  formatHelp,
} from "@/lib/terminal/commands";

describe("formatHelp", () => {
  it("lists every known verb with a summary", () => {
    const help = formatHelp();

    expect(help).toContain("available commands:");
    for (const verb of COMMAND_VERBS) {
      expect(help).toContain(verb);
    }
  });
});

describe("completeCommand", () => {
  it("completes a unique prefix to its verb", () => {
    expect(completeCommand("cl")).toBe("clear");
    expect(completeCommand("he")).toBe("help");
  });

  it("returns null for an ambiguous prefix", () => {
    // both "theme" and "toggle" start with "t"
    expect(completeCommand("t")).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(completeCommand("xyz")).toBeNull();
  });

  it("returns null for empty input or input past the verb", () => {
    expect(completeCommand("")).toBeNull();
    expect(completeCommand("theme syn")).toBeNull();
  });

  it("returns null when the verb is already complete", () => {
    expect(completeCommand("clear")).toBeNull();
  });
});
