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
  it("handles a local ui command without hitting the backend", async () => {
    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "theme synthwave{enter}",
    );

    expect(await screen.findByText("theme → synthwave")).toBeInTheDocument();
    expect(screen.getByText("theme synthwave")).toBeInTheDocument();
    expect(sendCommand).not.toHaveBeenCalled();
    expect(useDashboardStore.getState().theme).toBe("synthwave");
  });

  it("renders backend output and applies a returned side effect", async () => {
    const result: CommandResult = {
      success: true,
      kind: "data",
      output: "fetched",
      sideEffect: { action: "togglePanel", target: "weather" },
    };
    vi.mocked(sendCommand).mockResolvedValue(result);

    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "fetch weather{enter}",
    );

    // `data` results read in the secondary accent color.
    expect(await screen.findByText("fetched")).toHaveClass("text-accent-2");
    expect(useDashboardStore.getState().panels.weather).toBe(false);
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
    ).toHaveClass("text-error");
  });

  it("runs a hidden easter egg locally", async () => {
    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "sudo make me a sandwich{enter}",
    );

    expect(await screen.findByText(/incident has been reported/)).toHaveClass(
      "text-error",
    );
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it("focuses the input on mount", () => {
    render(<TerminalPanel />);
    expect(screen.getByLabelText("terminal input")).toHaveFocus();
  });

  it("recalls the previous command with ArrowUp and clears it with ArrowDown", async () => {
    render(<TerminalPanel />);
    const field = screen.getByLabelText<HTMLInputElement>("terminal input");

    await userEvent.type(field, "theme synthwave{enter}");
    expect(field).toHaveValue("");

    await userEvent.type(field, "{arrowup}");
    expect(field).toHaveValue("theme synthwave");

    await userEvent.type(field, "{arrowdown}");
    expect(field).toHaveValue("");
  });

  it("clears the screen with Ctrl+L", async () => {
    render(<TerminalPanel />);
    const field = screen.getByLabelText("terminal input");

    await userEvent.type(field, "theme synthwave{enter}");
    expect(await screen.findByText("theme synthwave")).toBeInTheDocument();

    await userEvent.type(field, "{Control>}l{/Control}");
    expect(screen.queryByText("theme synthwave")).not.toBeInTheDocument();
  });

  it("lists commands locally with help", async () => {
    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "help{enter}",
    );

    expect(await screen.findByText(/available commands:/)).toBeInTheDocument();
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it("accents the verbs in the help listing", async () => {
    render(<TerminalPanel />);
    await userEvent.type(
      screen.getByLabelText("terminal input"),
      "help{enter}",
    );

    // The verb token is accented; its summary stays in the muted system tone.
    expect(await screen.findByText("clear")).toHaveClass("text-accent");
    expect(screen.getByText("Clear the terminal screen.")).toHaveClass(
      "text-muted",
    );
  });

  it("empties the history with the clear command", async () => {
    render(<TerminalPanel />);
    const field = screen.getByLabelText("terminal input");

    await userEvent.type(field, "help{enter}");
    expect(await screen.findByText(/available commands:/)).toBeInTheDocument();

    await userEvent.type(field, "clear{enter}");
    expect(screen.queryByText(/available commands:/)).not.toBeInTheDocument();
    expect(screen.queryByText("help")).not.toBeInTheDocument();
  });

  it("auto-completes a unique command on Tab", async () => {
    render(<TerminalPanel />);
    const field = screen.getByLabelText<HTMLInputElement>("terminal input");

    await userEvent.type(field, "cl{Tab}");
    expect(field).toHaveValue("clear");
  });
});
