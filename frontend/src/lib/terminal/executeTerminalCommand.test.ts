import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardStore } from "@/store/useDashboardStore";

vi.mock("@/lib/terminal/sendCommand", () => ({ sendCommand: vi.fn() }));

import { sendCommand } from "@/lib/terminal/sendCommand";
import { executeTerminalCommand } from "@/lib/terminal/executeTerminalCommand";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
  vi.clearAllMocks();
});

describe("executeTerminalCommand", () => {
  it("resolves local ui commands client-side without calling the backend", async () => {
    const result = await executeTerminalCommand("theme synthwave");

    expect(sendCommand).not.toHaveBeenCalled();
    expect(useDashboardStore.getState().theme).toBe("synthwave");
    expect(result.success).toBe(true);
  });

  it("POSTs non-local commands to the backend", async () => {
    vi.mocked(sendCommand).mockResolvedValue({
      success: true,
      kind: "system",
      output: "pong",
    });

    const result = await executeTerminalCommand("ping");

    expect(sendCommand).toHaveBeenCalledOnce();
    expect(result.output).toBe("pong");
  });
});
