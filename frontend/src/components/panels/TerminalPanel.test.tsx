import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CommandResult } from "@contracts/CommandResult";
import { useDashboardStore } from "@/store/useDashboardStore";

vi.mock("@/lib/terminal/sendCommand", () => ({ sendCommand: vi.fn() }));

import { sendCommand } from "@/lib/terminal/sendCommand";
import TerminalPanel from "@/components/panels/TerminalPanel";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
  vi.clearAllMocks();
});

describe("TerminalPanel", () => {
  it("echoes the command, renders backend output, and applies the side effect", async () => {
    const result: CommandResult = {
      success: true,
      kind: "ui",
      output: "theme set to synthwave",
      sideEffect: { action: "setTheme", value: "synthwave" },
    };
    vi.mocked(sendCommand).mockResolvedValue(result);

    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "theme synthwave{enter}",
    );

    expect(
      await screen.findByText("theme set to synthwave"),
    ).toBeInTheDocument();
    expect(screen.getByText("theme synthwave")).toBeInTheDocument();
    expect(useDashboardStore.getState().theme).toBe("synthwave");
  });

  it("renders an error line when the command cannot reach the backend", async () => {
    vi.mocked(sendCommand).mockRejectedValue(new Error("network down"));

    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "ping{enter}",
    );

    expect(
      await screen.findByText(/could not reach the backend/),
    ).toBeInTheDocument();
  });
});
