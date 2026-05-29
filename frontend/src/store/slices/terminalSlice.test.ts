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
