import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/weather", () => ({ useWeatherQuery: vi.fn() }));
vi.mock("@/lib/api/sports", () => ({ useSportsQuery: vi.fn() }));
vi.mock("@/lib/api/github", () => ({ useGithubActivityQuery: vi.fn() }));
vi.mock("@/store/useDashboardStore", () => ({ useDashboardStore: vi.fn() }));

import { useGithubActivityQuery } from "@/lib/api/github";
import { useSportsQuery } from "@/lib/api/sports";
import { useWeatherQuery } from "@/lib/api/weather";
import { useBootReady } from "@/lib/boot/useBootReady";
import { useDashboardStore } from "@/store/useDashboardStore";

const SUCCESS = { isSuccess: true, isError: false };
const ERROR = { isSuccess: false, isError: true };
const PENDING = { isSuccess: false, isError: false };

interface ArrangeOptions {
  status: string;
  weather?: object;
  sports?: object;
  github?: object;
}

function arrange({ status, weather, sports, github }: ArrangeOptions) {
  vi.mocked(useWeatherQuery).mockReturnValue(
    (weather ?? SUCCESS) as unknown as ReturnType<typeof useWeatherQuery>,
  );
  vi.mocked(useSportsQuery).mockReturnValue(
    (sports ?? SUCCESS) as unknown as ReturnType<typeof useSportsQuery>,
  );
  vi.mocked(useGithubActivityQuery).mockReturnValue(
    (github ?? SUCCESS) as unknown as ReturnType<typeof useGithubActivityQuery>,
  );
  vi.mocked(useDashboardStore).mockImplementation(
    ((selector: (state: { status: string }) => unknown) =>
      selector({ status })) as typeof useDashboardStore,
  );
}

describe("useBootReady", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is not ready while feeds are pending and the uplink is connecting", () => {
    arrange({ status: "connecting", weather: PENDING, sports: PENDING, github: PENDING });

    const { result } = renderHook(() => useBootReady());

    expect(result.current.ready).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("is ready once every feed has settled and the uplink is online", () => {
    arrange({ status: "online" });

    const { result } = renderHook(() => useBootReady());

    expect(result.current.ready).toBe(true);
    expect(result.current.progress).toBe(1);
  });

  it("treats a failed feed as settled but flags it", () => {
    arrange({ status: "online", weather: ERROR });

    const { result } = renderHook(() => useBootReady());

    expect(result.current.ready).toBe(true);
    expect(result.current.tasks.find((task) => task.id === "weather")).toMatchObject({
      done: true,
      failed: true,
    });
  });

  it("reports partial progress while the uplink is still connecting", () => {
    // Three feeds settled, uplink not yet online → 3 of 4 tasks done.
    arrange({ status: "connecting" });

    const { result } = renderHook(() => useBootReady());

    expect(result.current.ready).toBe(false);
    expect(result.current.progress).toBe(0.75);
  });
});
