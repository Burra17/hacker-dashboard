import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SportsPayload } from "@contracts/SportsPayload";
import SportsPanel from "@/components/panels/SportsPanel";
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
    recentResults: ["Chelsea 3 - 1 Arsenal", "Chelsea 0 - 2 City"],
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

describe("SportsPanel", () => {
  it("renders both teams' most recent result and next fixtures", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({ data: reading, isError: false, isPending: false }),
    );

    render(<SportsPanel />);

    expect(screen.getByText("Hammarby")).toBeInTheDocument();
    // The panel shows only the most recent result (recentResults[0]).
    expect(screen.getByText("Hammarby 2 - 0 AIK")).toBeInTheDocument();
    expect(screen.getByText("Chelsea 3 - 1 Arsenal")).toBeInTheDocument();
    expect(screen.getByText(/Djurgården/)).toBeInTheDocument();
    expect(screen.getByText(/Liverpool/)).toBeInTheDocument();
    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
  });

  it("dims when the payload is stale", () => {
    mockUseSportsQuery.mockReturnValue(
      queryResult({ data: { ...reading, stale: true }, isError: false, isPending: false }),
    );

    render(<SportsPanel />);

    expect(screen.getByText("STALE")).toBeInTheDocument();
  });
});
