import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DashboardEvent } from "@contracts/DashboardEvent";
import SystemLogsPanel from "@/components/panels/SystemLogsPanel";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";

function delta(eventId: string, level: string, source: string, message: string): DashboardEvent {
  return {
    eventId,
    channel: DASHBOARD_CHANNELS.systemLogs,
    type: "delta",
    timestamp: "2026-06-03T10:00:00Z",
    payload: { level, source, message },
  } as DashboardEvent;
}

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("SystemLogsPanel", () => {
  it("shows a placeholder when there are no logs yet", () => {
    render(<SystemLogsPanel />);

    expect(screen.getByText("// inga loggar än")).toBeInTheDocument();
  });

  it("renders delta lines newest first", () => {
    useDashboardStore.setState({
      streams: {
        [DASHBOARD_CHANNELS.systemLogs]: [
          delta("e1", "info", "kernel", "boot ok"),
          delta("e2", "error", "auth", "login failed"),
        ],
      },
    });

    render(<SystemLogsPanel />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("login failed"); // newest first
    expect(items[1]).toHaveTextContent("boot ok");
  });

  it("flattens a snapshot's history into lines", () => {
    const snapshot: DashboardEvent = {
      eventId: "snap",
      channel: DASHBOARD_CHANNELS.systemLogs,
      type: "snapshot",
      timestamp: "2026-06-03T10:00:00Z",
      payload: [
        { level: "debug", source: "net", message: "link up" },
        { level: "warning", source: "disk", message: "low space" },
      ],
    } as DashboardEvent;
    useDashboardStore.setState({
      streams: { [DASHBOARD_CHANNELS.systemLogs]: [snapshot] },
    });

    render(<SystemLogsPanel />);

    expect(screen.getByText(/link up/)).toBeInTheDocument();
    expect(screen.getByText(/low space/)).toBeInTheDocument();
  });
});
