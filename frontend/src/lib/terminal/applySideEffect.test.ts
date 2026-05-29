import { beforeEach, describe, expect, it } from "vitest";
import { applySideEffect } from "@/lib/terminal/applySideEffect";
import { useDashboardStore } from "@/store/useDashboardStore";

beforeEach(() => {
  useDashboardStore.setState(useDashboardStore.getInitialState(), true);
});

describe("applySideEffect", () => {
  it("setTheme switches the active theme", () => {
    applySideEffect({ action: "setTheme", value: "synthwave" });

    expect(useDashboardStore.getState().theme).toBe("synthwave");
  });

  it("togglePanel flips a panel's visibility", () => {
    expect(useDashboardStore.getState().panels.weather).toBe(true);

    applySideEffect({ action: "togglePanel", target: "weather" });

    expect(useDashboardStore.getState().panels.weather).toBe(false);
  });

  it("ignores an unknown action", () => {
    applySideEffect({ action: "explode" });

    expect(useDashboardStore.getState().theme).toBe("matrix");
  });

  it("ignores setTheme with an unrecognized theme name", () => {
    applySideEffect({ action: "setTheme", value: "neon" });

    expect(useDashboardStore.getState().theme).toBe("matrix");
  });
});
