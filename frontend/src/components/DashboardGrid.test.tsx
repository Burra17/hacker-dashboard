import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import DashboardGrid from "@/components/DashboardGrid";
import { useDashboardStore } from "@/store/useDashboardStore";

// The weather/sports panels poll over TanStack Query; stub the hooks so this test
// stays focused on panel visibility and needs no QueryClientProvider.
vi.mock("@/lib/api/weather", () => ({
  useWeatherQuery: () => ({ data: undefined, isError: false, isPending: true }),
}));
vi.mock("@/lib/api/sports", () => ({
  useSportsQuery: () => ({ data: undefined, isError: false, isPending: true }),
}));
vi.mock("@/lib/api/github", () => ({
  useGithubActivityQuery: () => ({ data: undefined, isError: false, isPending: true }),
}));

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("DashboardGrid panel visibility", () => {
  it("hides a panel when its ui.panels flag is toggled off", () => {
    render(<DashboardGrid />);
    expect(screen.getByText("system logs")).toBeInTheDocument();

    act(() => useDashboardStore.getState().togglePanel("logs"));

    expect(screen.queryByText("system logs")).not.toBeInTheDocument();
  });
});
