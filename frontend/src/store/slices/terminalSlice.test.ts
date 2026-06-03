import { beforeEach, describe, expect, it } from "vitest";
import { useDashboardStore } from "@/store/useDashboardStore";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("terminal response streaming", () => {
  it("appends tokens into a single open response line", () => {
    const { appendResponseToken } = useDashboardStore.getState();

    appendResponseToken("Hello");
    appendResponseToken(" world");

    const { history } = useDashboardStore.getState();
    expect(history).toHaveLength(1);
    expect(history[0].kind).toBe("response");
    expect(history[0].text).toBe("Hello world");
    expect(history[0].streaming).toBe(true);
  });

  it("endResponse closes the line so the next token starts a new one", () => {
    const { appendResponseToken, endResponse } = useDashboardStore.getState();

    appendResponseToken("first");
    endResponse();
    appendResponseToken("second");

    const { history } = useDashboardStore.getState();
    expect(history).toHaveLength(2);
    expect(history[0].streaming).toBe(false);
    expect(history[1].text).toBe("second");
    expect(history[1].streaming).toBe(true);
  });
});

describe("command history recall", () => {
  it("does nothing when there is no command history", () => {
    useDashboardStore.getState().recallPrevious();
    useDashboardStore.getState().recallNext();

    const { input, historyCursor } = useDashboardStore.getState();
    expect(input).toBe("");
    expect(historyCursor).toBeNull();
  });

  it("pushCommand skips blanks and consecutive duplicates", () => {
    const { pushCommand } = useDashboardStore.getState();

    pushCommand("ls");
    pushCommand("   "); // blank
    pushCommand("ls"); // consecutive duplicate
    pushCommand("theme synthwave");

    expect(useDashboardStore.getState().commandHistory).toEqual([
      "ls",
      "theme synthwave",
    ]);
  });

  it("recallPrevious walks newest to oldest and clamps at the first entry", () => {
    const { pushCommand, recallPrevious } = useDashboardStore.getState();
    pushCommand("one");
    pushCommand("two");

    recallPrevious();
    expect(useDashboardStore.getState().input).toBe("two");

    recallPrevious();
    expect(useDashboardStore.getState().input).toBe("one");

    recallPrevious(); // clamps — stays at the oldest
    expect(useDashboardStore.getState().input).toBe("one");
    expect(useDashboardStore.getState().historyCursor).toBe(0);
  });

  it("recallNext walks back toward newest and returns to a blank line", () => {
    const { pushCommand, recallPrevious, recallNext } =
      useDashboardStore.getState();
    pushCommand("one");
    pushCommand("two");

    recallPrevious();
    recallPrevious();
    expect(useDashboardStore.getState().input).toBe("one");

    recallNext();
    expect(useDashboardStore.getState().input).toBe("two");

    recallNext(); // past the newest → fresh prompt
    expect(useDashboardStore.getState().input).toBe("");
    expect(useDashboardStore.getState().historyCursor).toBeNull();
  });

  it("setInput resets the recall cursor", () => {
    const { pushCommand, recallPrevious, setInput } =
      useDashboardStore.getState();
    pushCommand("one");

    recallPrevious();
    expect(useDashboardStore.getState().historyCursor).toBe(0);

    setInput("typing");
    expect(useDashboardStore.getState().historyCursor).toBeNull();
  });
});
