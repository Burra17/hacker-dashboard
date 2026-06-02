import { describe, expect, it } from "vitest";
import { toActivityLines } from "@/lib/api/github";

const event = (
  id: string,
  type: string,
  payload: Record<string, unknown>,
  repo = "Burra17/hacker-dashboard",
) => ({ id, type, created_at: "2026-06-02T10:00:00Z", repo: { name: repo }, payload });

describe("toActivityLines", () => {
  it("describes each handled event type as a log line", () => {
    const lines = toActivityLines([
      event("1", "PushEvent", { ref: "refs/heads/main" }),
      event("2", "PullRequestEvent", { action: "closed", pull_request: { number: 59, merged: true } }),
      event("3", "PullRequestEvent", { action: "opened", pull_request: { number: 60, merged: false } }),
      event("4", "IssuesEvent", { action: "opened", issue: { number: 47 } }),
      event("5", "CreateEvent", { ref_type: "branch", ref: "47-issue-49" }),
      event("6", "DeleteEvent", { ref_type: "branch", ref: "old-branch" }),
    ]);

    expect(lines.map((l) => l.message)).toEqual([
      "pushed → main",
      "merged PR #59",
      "opened PR #60",
      "opened issue #47",
      "created branch 47-issue-49",
      "deleted branch old-branch",
    ]);
  });

  it("strips the owner prefix from the repo and carries the timestamp + key", () => {
    const [line] = toActivityLines([event("42", "PushEvent", { ref: "refs/heads/main" })]);

    expect(line.repo).toBe("hacker-dashboard");
    expect(line.key).toBe("42");
    expect(line.timestamp).toBe("2026-06-02T10:00:00Z");
  });

  it("skips unhandled event types", () => {
    const lines = toActivityLines([
      event("7", "ForkEvent", {}),
      event("8", "MemberEvent", {}),
    ]);

    expect(lines).toEqual([]);
  });
});
