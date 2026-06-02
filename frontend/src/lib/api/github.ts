import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { POLL_INTERVAL_MS } from "@/lib/config";

const GITHUB_USER = "Burra17";
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public`;

/** One GitHub activity event, flattened into a renderable log line. */
export interface ActivityLine {
  /** Stable React key — the GitHub event id. */
  key: string;
  /** When the activity happened — ISO 8601. */
  timestamp: string;
  /** Repository name without the owner prefix, e.g. "hacker-dashboard". */
  repo: string;
  /** Human-readable activity description, e.g. "merged PR #59". */
  message: string;
}

// Minimal shapes for the fields we read from the public GitHub events API.
interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    ref?: string | null;
    ref_type?: string;
    action?: string;
    issue?: { number: number };
    pull_request?: { number: number; merged?: boolean };
  };
}

const branchFromRef = (ref: string | null | undefined): string =>
  (ref ?? "").replace("refs/heads/", "");

/** Map a GitHub event to a short activity description, or null to skip noise. */
function describe(event: GithubEvent): string | null {
  const p = event.payload;
  switch (event.type) {
    case "PushEvent":
      return `pushed → ${branchFromRef(p.ref)}`;
    case "PullRequestEvent": {
      const verb = p.action === "closed" && p.pull_request?.merged ? "merged" : p.action;
      return `${verb} PR #${p.pull_request?.number}`;
    }
    case "IssuesEvent":
      return `${p.action} issue #${p.issue?.number}`;
    case "CreateEvent":
      return `created ${p.ref_type}${p.ref ? ` ${p.ref}` : ""}`;
    case "DeleteEvent":
      return `deleted ${p.ref_type} ${p.ref}`;
    case "WatchEvent":
      return "starred repo";
    default:
      return null;
  }
}

/** Flatten the raw events into renderable activity log lines, skipping unhandled types. */
export function toActivityLines(events: GithubEvent[]): ActivityLine[] {
  const lines: ActivityLine[] = [];
  for (const event of events) {
    const message = describe(event);
    if (message === null) continue;
    lines.push({
      key: event.id,
      timestamp: event.created_at,
      repo: event.repo.name.split("/").at(-1) ?? event.repo.name,
      message,
    });
  }
  return lines;
}

async function fetchGithubActivity(): Promise<ActivityLine[]> {
  const { data } = await axios.get<GithubEvent[]>(EVENTS_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });
  return toActivityLines(data);
}

export const GITHUB_ACTIVITY_QUERY_KEY = ["github-activity"] as const;

/** Polls the user's recent public GitHub activity (TanStack Query — never Zustand). */
export function useGithubActivityQuery() {
  return useQuery({
    queryKey: GITHUB_ACTIVITY_QUERY_KEY,
    queryFn: fetchGithubActivity,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
