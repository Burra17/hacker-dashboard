import { render } from "@testing-library/react";
import { HubConnectionState } from "@microsoft/signalr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const start = vi.fn();
const fakeConnection = {
  state: HubConnectionState.Disconnected,
  start,
  on: vi.fn(),
  off: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  onclose: vi.fn(),
};

vi.mock("@/lib/signalr/connection", () => ({
  RECEIVE_DASHBOARD_EVENT: "ReceiveDashboardEvent",
  getConnection: () => fakeConnection,
}));
vi.mock("@/lib/signalr/routeDashboardEvent", () => ({
  routeDashboardEvent: vi.fn(),
}));

import DashboardConnection from "@/components/DashboardConnection";
import { useDashboardStore } from "@/store/useDashboardStore";

const status = () => useDashboardStore.getState().status;

beforeEach(() => {
  vi.useFakeTimers();
  start.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  // Start from a non-connecting value to prove the component sets "connecting".
  useDashboardStore.setState({ status: "offline" });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("DashboardConnection", () => {
  it("retries the initial connection without marking the uplink offline", async () => {
    start
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(undefined);

    render(<DashboardConnection />);
    expect(status()).toBe("connecting");

    // First attempt rejects — status must stay "connecting", not "offline".
    await vi.advanceTimersByTimeAsync(0);
    expect(status()).toBe("connecting");

    // After the retry delay the second attempt succeeds → online.
    await vi.advanceTimersByTimeAsync(2000);
    expect(status()).toBe("online");
    expect(start).toHaveBeenCalledTimes(2);
  });

  it("keeps retrying and stays connecting while the backend is unavailable", async () => {
    start.mockRejectedValue(new Error("Failed to fetch"));

    render(<DashboardConnection />);

    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(2000);

    expect(status()).toBe("connecting");
    expect(start.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
