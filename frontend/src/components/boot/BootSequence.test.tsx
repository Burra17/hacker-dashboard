import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      role,
      ...rest
    }: {
      children?: React.ReactNode;
      className?: string;
      role?: string;
      [key: string]: unknown;
    }) => (
      <div
        className={className}
        role={role}
        aria-busy={rest["aria-busy"] as boolean | undefined}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: () => false,
}));

vi.mock("@/components/boot/ScrambleText", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/lib/boot/useBootReady", () => ({ useBootReady: vi.fn() }));

import BootSequence from "@/components/boot/BootSequence";
import { useBootReady } from "@/lib/boot/useBootReady";

const TASKS = [
  { id: "uplink", label: "ESTABLISHING UPLINK", done: true, failed: false },
];
const ALL_READY = { ready: true, progress: 1, tasks: TASKS };
const NEVER_READY = {
  ready: false,
  progress: 0,
  tasks: [{ ...TASKS[0], done: false }],
};

const mockReady = (state: object) =>
  vi
    .mocked(useBootReady)
    .mockReturnValue(state as unknown as ReturnType<typeof useBootReady>);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("BootSequence", () => {
  it("holds the overlay until the minimum boot duration even when data is ready", () => {
    mockReady(ALL_READY);
    render(<BootSequence />);

    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("ALL SYSTEMS ONLINE")).not.toBeInTheDocument();
  });

  it("holds on the green checklist, then prints the final message, then reveals", () => {
    mockReady(ALL_READY);
    render(<BootSequence />);

    act(() => vi.advanceTimersByTime(2500)); // min duration elapsed → green hold begins
    expect(screen.getByText("ESTABLISHING UPLINK")).toBeInTheDocument(); // checklist still up
    expect(screen.queryByText("ALL SYSTEMS ONLINE")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1100)); // green hold → finishing
    expect(screen.getByText("ALL SYSTEMS ONLINE")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1100)); // finish hold → done
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("completes via the safety cap even if readiness never arrives", () => {
    mockReady(NEVER_READY);
    render(<BootSequence />);

    act(() => vi.advanceTimersByTime(8000)); // max boot reached → green hold begins
    act(() => vi.advanceTimersByTime(1100)); // green hold → finishing
    expect(screen.getByText("ALL SYSTEMS ONLINE")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1100)); // finish hold → done
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
