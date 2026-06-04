import { beforeEach, describe, expect, it } from "vitest";
import type { TerminalCommand } from "@contracts/TerminalCommand";
import { isLocalCommand, runLocalCommand } from "@/lib/terminal/localCommands";
import { useDashboardStore } from "@/store/useDashboardStore";

const cmd = (verb: string, arg?: string): TerminalCommand => ({
  raw: arg ? `${verb} ${arg}` : verb,
  verb,
  args: arg ? { "0": arg } : {},
});

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("isLocalCommand", () => {
  it("recognizes verbs with a run handler, including hidden easter eggs", () => {
    expect(isLocalCommand("theme")).toBe(true);
    expect(isLocalCommand("toggle")).toBe(true);
    expect(isLocalCommand("help")).toBe(true);
    expect(isLocalCommand("clear")).toBe(true);
    expect(isLocalCommand("whoami")).toBe(true);
    expect(isLocalCommand("sudo")).toBe(true);
    // backend verbs (no run handler) and unknowns are not local
    expect(isLocalCommand("prompt")).toBe(false);
    expect(isLocalCommand("nope")).toBe(false);
  });
});

describe("runLocalCommand", () => {
  it("lists the available commands for help", () => {
    const result = runLocalCommand(cmd("help"));

    expect(result.success).toBe(true);
    expect(result.kind).toBe("system");
    expect(result.output).toContain("available commands:");
    expect(result.output).toContain("clear");
  });

  it("clears the terminal history with empty output", () => {
    useDashboardStore.getState().pushLine({ kind: "output", text: "stale" });

    const result = runLocalCommand(cmd("clear"));

    expect(result.success).toBe(true);
    expect(result.output).toBe("");
    expect(useDashboardStore.getState().history).toHaveLength(0);
  });

  it("sets a valid theme and reports success", () => {
    const result = runLocalCommand(cmd("theme", "synthwave"));

    expect(result.success).toBe(true);
    expect(useDashboardStore.getState().theme).toBe("synthwave");
  });

  it("rejects an unknown theme without changing state", () => {
    const result = runLocalCommand(cmd("theme", "nord"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("nord");
    expect(useDashboardStore.getState().theme).toBe("matrix");
  });

  it("shows usage when theme has no argument", () => {
    const result = runLocalCommand(cmd("theme"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("usage");
  });

  it("toggles a valid panel's visibility", () => {
    expect(useDashboardStore.getState().panels.weather).toBe(true);

    const result = runLocalCommand(cmd("toggle", "weather"));

    expect(result.success).toBe(true);
    expect(useDashboardStore.getState().panels.weather).toBe(false);
  });

  it("rejects an unknown panel", () => {
    const result = runLocalCommand(cmd("toggle", "banana"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("banana");
  });

  it("refuses to hide the terminal and leaves it visible", () => {
    const result = runLocalCommand(cmd("toggle", "terminal"));

    expect(result.success).toBe(false);
    expect(result.output).toBe("Error: Cannot hide primary control terminal");
    expect(useDashboardStore.getState().panels.terminal).toBe(true);
  });

  it("runs the whoami easter egg as a successful system result", () => {
    const result = runLocalCommand(cmd("whoami"));

    expect(result.success).toBe(true);
    expect(result.kind).toBe("system");
    expect(result.output.length).toBeGreaterThan(0);
  });

  it("runs the sudo easter egg as a failed result", () => {
    const result = runLocalCommand(cmd("sudo"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("reported");
  });

  it("throws if asked to run a non-local verb", () => {
    expect(() => runLocalCommand(cmd("prompt"))).toThrow();
  });
});
