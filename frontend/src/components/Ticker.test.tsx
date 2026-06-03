import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SportsPayload } from "@contracts/SportsPayload";
import Ticker from "@/components/Ticker";
import { useSportsQuery } from "@/lib/api/sports";

vi.mock("@/lib/api/sports", () => ({ useSportsQuery: vi.fn() }));
const mockUseSportsQuery = vi.mocked(useSportsQuery);

const reading: SportsPayload = {
  hammarby: {
    team: "Hammarby",
    recentResults: ["Hammarby 2 - 0 AIK", "Hammarby 1 - 1 IFK"],
    nextMatch: { date: "2026-06-08", time: "15:00", opponent: "Djurgården" },
  },
  chelsea: {
    team: "Chelsea",
    recentResults: ["Chelsea 3 - 1 Arsenal"],
    nextMatch: { date: "2026-06-07", time: "17:30", opponent: "Liverpool" },
  },
  observedAt: "2026-06-02T10:00:00Z",
  stale: false,
};

type SportsQueryResult = ReturnType<typeof useSportsQuery>;
function queryResult(partial: Partial<SportsQueryResult>): SportsQueryResult {
  return partial as unknown as SportsQueryResult;
}

beforeEach(() => mockUseSportsQuery.mockReset());

describe("Ticker", () => {
  it("loops through both teams' recent results from the sports query", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({ data: reading, isError: false, isPending: false }),
    );

    render(<Ticker />);

    // Two marquee copies (one aria-hidden) → each result appears twice.
    expect(screen.getAllByText("Hammarby 2 - 0 AIK")).toHaveLength(2);
    expect(screen.getAllByText("Hammarby 1 - 1 IFK")).toHaveLength(2);
    expect(screen.getAllByText("Chelsea 3 - 1 Arsenal")).toHaveLength(2);
  });

  it("shows a loading message while the first fetch is pending", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({ data: undefined, isError: false, isPending: true }),
    );

    render(<Ticker />);

    expect(screen.getByText("// hämtar sport…")).toBeInTheDocument();
  });

  it("shows an unavailable message on error with no data", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({ data: undefined, isError: true, isPending: false }),
    );

    render(<Ticker />);

    expect(screen.getByText("// sport otillgängligt")).toBeInTheDocument();
  });

  it("dims the scrolling text but keeps results when the payload is stale", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({
        data: { ...reading, stale: true },
        isError: false,
        isPending: false,
      }),
    );

    const { container } = render(<Ticker />);

    expect(screen.getAllByText("Hammarby 2 - 0 AIK")).toHaveLength(2);
    expect(container.querySelector(".opacity-40")).not.toBeNull();
  });
});
