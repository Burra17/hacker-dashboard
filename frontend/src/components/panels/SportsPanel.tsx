"use client";

import Panel from "@/components/Panel";
import { useSportsQuery } from "@/lib/api/sports";

export default function SportsPanel({ className }: { className?: string }) {
  const { data, isError, isPending } = useSportsQuery();
  // Dim on a failed refresh (keep last-known data) or when the backend flags the value stale.
  const stale = isError || (data?.stale ?? false);

  return (
    <Panel title="sports" className={className} stale={stale}>
      {data ? (
        <ul className="space-y-3">
          {[data.hammarby, data.chelsea].map((team) => (
            <li key={team.team}>
              <p className="font-bold text-accent">{team.team}</p>
              <p className="text-fg">{team.latestResult}</p>
              <p className="text-muted">
                nästa: {team.nextMatch.opponent} · {team.nextMatch.date}{" "}
                {team.nextMatch.time}
              </p>
            </li>
          ))}
        </ul>
      ) : isPending ? (
        <p className="text-muted">{"// hämtar sport…"}</p>
      ) : (
        <p className="text-muted">{"// sport otillgängligt"}</p>
      )}
    </Panel>
  );
}
