import { beforeEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import ThemeSync from "@/components/ThemeSync";
import { useDashboardStore } from "@/store/useDashboardStore";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSync", () => {
  it("applies the active theme to <html> on mount", () => {
    render(<ThemeSync />);

    expect(document.documentElement.dataset.theme).toBe("matrix");
  });

  it("updates data-theme when the theme changes", () => {
    render(<ThemeSync />);

    act(() => useDashboardStore.getState().setTheme("synthwave"));

    expect(document.documentElement.dataset.theme).toBe("synthwave");
  });
});
