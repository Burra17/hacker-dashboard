import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { WeatherPayload } from "@contracts/WeatherPayload";
import WeatherPanel from "@/components/panels/WeatherPanel";
import { useWeatherQuery } from "@/lib/api/weather";

vi.mock("@/lib/api/weather", () => ({ useWeatherQuery: vi.fn() }));
const mockUseWeatherQuery = vi.mocked(useWeatherQuery);

const reading: WeatherPayload = {
  location: "Hudiksvall",
  temperatureCelsius: 20.9,
  condition: "Overcast",
  observedAt: "2026-06-02T10:00:00Z",
  stale: false,
};

type WeatherQueryResult = ReturnType<typeof useWeatherQuery>;
function queryResult(partial: Partial<WeatherQueryResult>): WeatherQueryResult {
  return partial as unknown as WeatherQueryResult;
}

beforeEach(() => mockUseWeatherQuery.mockReset());

describe("WeatherPanel", () => {
  it("renders the fetched reading and is not dimmed", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: reading, isError: false, isPending: false }),
    );

    render(<WeatherPanel />);

    expect(screen.getByText("Hudiksvall")).toBeInTheDocument();
    expect(screen.getByText("20.9°C")).toBeInTheDocument();
    expect(screen.getByText("Overcast")).toBeInTheDocument();
    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
  });

  it("dims while keeping last-known data when the payload is stale", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: { ...reading, stale: true }, isError: false, isPending: false }),
    );

    render(<WeatherPanel />);

    expect(screen.getByText("STALE")).toBeInTheDocument();
    expect(screen.getByText("Hudiksvall")).toBeInTheDocument();
  });

  it("dims on a failed refresh", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: reading, isError: true, isPending: false }),
    );

    render(<WeatherPanel />);

    expect(screen.getByText("STALE")).toBeInTheDocument();
  });

  it("does not dim while a background refetch is in flight", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({
        data: reading,
        isError: false,
        isPending: false,
        isFetching: true,
        isRefetching: true,
      }),
    );

    render(<WeatherPanel />);

    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
    expect(screen.getByText("Hudiksvall")).toBeInTheDocument();
  });

  it("does not dim during the initial load", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: undefined, isError: false, isPending: true, isLoading: true }),
    );

    render(<WeatherPanel />);

    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
    expect(screen.getByText("// hämtar väder…")).toBeInTheDocument();
  });
});
