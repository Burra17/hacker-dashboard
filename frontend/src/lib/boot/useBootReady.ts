import { useGithubActivityQuery } from "@/lib/api/github";
import { useSportsQuery } from "@/lib/api/sports";
import { useWeatherQuery } from "@/lib/api/weather";
import { useDashboardStore } from "@/store/useDashboardStore";

/** One initialization signal shown as a line in the boot sequence. */
export interface BootTask {
  id: string;
  label: string;
  /** Settled — succeeded or failed; the boot may proceed past it. */
  done: boolean;
  /** Settled but in error — the panel will degrade to stale. */
  failed: boolean;
}

export interface BootReadyState {
  tasks: BootTask[];
  /** Every task has settled and the uplink is online. */
  ready: boolean;
  /** Fraction of tasks settled, 0..1 — drives the ASCII progress bar. */
  progress: number;
}

/**
 * Aggregates the dashboard's initial readiness signals for the boot sequence:
 * the SignalR uplink plus each polled HTTP feed. A feed counts as "done" once it
 * has *settled* (success OR error) so a dead upstream can't stall the boot — the
 * caller still caps total boot time as a final safety net.
 */
export function useBootReady(): BootReadyState {
  const weather = useWeatherQuery();
  const sports = useSportsQuery();
  const github = useGithubActivityQuery();
  const status = useDashboardStore((s) => s.status);

  const tasks: BootTask[] = [
    {
      id: "uplink",
      label: "ESTABLISHING UPLINK",
      done: status === "online",
      failed: status === "offline",
    },
    {
      id: "weather",
      label: "WEATHER TELEMETRY",
      done: weather.isSuccess || weather.isError,
      failed: weather.isError,
    },
    {
      id: "sports",
      label: "SPORTS FEED",
      done: sports.isSuccess || sports.isError,
      failed: sports.isError,
    },
    {
      id: "github",
      label: "GITHUB ACTIVITY",
      done: github.isSuccess || github.isError,
      failed: github.isError,
    },
  ];

  const doneCount = tasks.filter((task) => task.done).length;

  return {
    tasks,
    ready: doneCount === tasks.length,
    progress: doneCount / tasks.length,
  };
}
