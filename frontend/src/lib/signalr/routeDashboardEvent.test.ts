import { beforeEach, describe, expect, it } from "vitest";
import type { DashboardEvent } from "@contracts/DashboardEvent";
import { routeDashboardEvent } from "@/lib/signalr/routeDashboardEvent";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";
import { useDashboardStore } from "@/store/useDashboardStore";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

const responseEvent = (token: string, done: boolean): DashboardEvent => ({
  eventId: crypto.randomUUID(),
  channel: DASHBOARD_CHANNELS.terminalResponse,
  type: "delta",
  timestamp: new Date().toISOString(),
  payload: { token, done },
});

describe("routeDashboardEvent — terminal.response", () => {
  it("streams tokens into one history line and finalizes on done", () => {
    routeDashboardEvent(responseEvent("Hel", false));
    routeDashboardEvent(responseEvent("lo", false));
    routeDashboardEvent(responseEvent("", true));

    const { history } = useDashboardStore.getState();
    expect(history).toHaveLength(1);
    expect(history[0].kind).toBe("response");
    expect(history[0].text).toBe("Hello");
    expect(history[0].streaming).toBe(false);
  });
});
