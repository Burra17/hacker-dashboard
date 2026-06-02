import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GithubActivityPanel from "@/components/panels/GithubActivityPanel";
import { useGithubActivityQuery, type ActivityLine } from "@/lib/api/github";

vi.mock("@/lib/api/github", () => ({ useGithubActivityQuery: vi.fn() }));
const mockUseGithubActivityQuery = vi.mocked(useGithubActivityQuery);

const activity: ActivityLine[] = [
  {
    key: "1",
    timestamp: "2026-06-02T10:00:00Z",
    repo: "hacker-dashboard",
    message: "merged PR #59",
  },
];

type GithubQueryResult = ReturnType<typeof useGithubActivityQuery>;
function queryResult(partial: Partial<GithubQueryResult>): GithubQueryResult {
  return partial as unknown as GithubQueryResult;
}

beforeEach(() => mockUseGithubActivityQuery.mockReset());

describe("GithubActivityPanel", () => {
  it("renders activity as log lines with repo and message", () => {
    mockUseGithubActivityQuery.mockReturnValue(
      queryResult({ data: activity, isError: false, isPending: false }),
    );

    render(<GithubActivityPanel />);

    expect(screen.getByText("[hacker-dashboard]")).toBeInTheDocument();
    expect(screen.getByText(/merged PR #59/)).toBeInTheDocument();
    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
  });

  it("dims when the GitHub fetch fails", () => {
    mockUseGithubActivityQuery.mockReturnValue(
      queryResult({ data: undefined, isError: true, isPending: false }),
    );

    render(<GithubActivityPanel />);

    expect(screen.getByText("STALE")).toBeInTheDocument();
    expect(screen.getByText("// aktivitet otillgänglig")).toBeInTheDocument();
  });
});
