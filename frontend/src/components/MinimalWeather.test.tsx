import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { WeatherPayload } from "@contracts/WeatherPayload";
import MinimalWeather from "@/components/MinimalWeather";
import { useWeatherQuery } from "@/lib/api/weather";

vi.mock("@/lib/api/weather", () => ({ useWeatherQuery: vi.fn() }));
const mockUseWeatherQuery = vi.mocked(useWeatherQuery);

const reading: WeatherPayload = {
  location: "Hudiksvall",
  temperatureCelsius: 20.7,
  condition: "Overcast",
  observedAt: "2026-06-02T10:00:00Z",
  stale: false,
};

type WeatherQueryResult = ReturnType<typeof useWeatherQuery>;
function queryResult(partial: Partial<WeatherQueryResult>): WeatherQueryResult {
  return partial as unknown as WeatherQueryResult;
}

beforeEach(() => mockUseWeatherQuery.mockReset());

describe("MinimalWeather", () => {
  it("renders a compact status string", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: reading, isError: false, isPending: false }),
    );

    render(<MinimalWeather />);

    expect(screen.getByText("Hudiksvall")).toBeInTheDocument();
    expect(screen.getByText("20.7°C")).toBeInTheDocument();
    expect(screen.getByText("Overcast")).toBeInTheDocument();
  });

  it("dims while keeping the value when stale", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: { ...reading, stale: true }, isError: false, isPending: false }),
    );

    const { container } = render(<MinimalWeather />);

    expect(screen.getByText("Hudiksvall")).toBeInTheDocument();
    expect(container.querySelector(".opacity-40")).not.toBeNull();
  });

  it("shows a loading hint while the first fetch is pending", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: undefined, isError: false, isPending: true }),
    );

    render(<MinimalWeather />);

    expect(screen.getByText("[ väder… ]")).toBeInTheDocument();
  });

  it("shows an unavailable hint on error with no data", () => {
    mockUseWeatherQuery.mockReturnValue(
      queryResult({ data: undefined, isError: true, isPending: false }),
    );

    render(<MinimalWeather />);

    expect(screen.getByText("[ väder otillgängligt ]")).toBeInTheDocument();
  });
});
