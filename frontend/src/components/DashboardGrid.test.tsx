import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import DashboardGrid from "@/components/DashboardGrid";
import { useDashboardStore } from "@/store/useDashboardStore";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("DashboardGrid panel visibility", () => {
  it("hides a panel when its ui.panels flag is toggled off", () => {
    render(<DashboardGrid />);
    expect(screen.getByText("weather")).toBeInTheDocument();

    act(() => useDashboardStore.getState().togglePanel("weather"));

    expect(screen.queryByText("weather")).not.toBeInTheDocument();
  });
});
