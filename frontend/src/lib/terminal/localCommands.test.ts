import { beforeEach, describe, expect, it } from "vitest";
import type { TerminalCommand } from "@contracts/TerminalCommand";
import { isLocalCommand, runLocalUiCommand } from "@/lib/terminal/localCommands";
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
  it("recognizes the local ui verbs and nothing else", () => {
    expect(isLocalCommand("theme")).toBe(true);
    expect(isLocalCommand("toggle")).toBe(true);
    expect(isLocalCommand("prompt")).toBe(false);
  });
});

describe("runLocalUiCommand", () => {
  it("sets a valid theme and reports success", () => {
    const result = runLocalUiCommand(cmd("theme", "synthwave"));

    expect(result.success).toBe(true);
    expect(useDashboardStore.getState().theme).toBe("synthwave");
  });

  it("rejects an unknown theme without changing state", () => {
    const result = runLocalUiCommand(cmd("theme", "nord"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("nord");
    expect(useDashboardStore.getState().theme).toBe("matrix");
  });

  it("shows usage when theme has no argument", () => {
    const result = runLocalUiCommand(cmd("theme"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("usage");
  });

  it("toggles a valid panel's visibility", () => {
    expect(useDashboardStore.getState().panels.weather).toBe(true);

    const result = runLocalUiCommand(cmd("toggle", "weather"));

    expect(result.success).toBe(true);
    expect(useDashboardStore.getState().panels.weather).toBe(false);
  });

  it("rejects an unknown panel", () => {
    const result = runLocalUiCommand(cmd("toggle", "banana"));

    expect(result.success).toBe(false);
    expect(result.output).toContain("banana");
  });
});
