import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrambleText from "@/components/boot/ScrambleText";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ScrambleText", () => {
  it("settles on the final text after the scramble duration", () => {
    vi.useFakeTimers();
    render(<ScrambleText text="GRANTED" durationMs={200} />);

    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByLabelText("GRANTED")).toHaveTextContent("GRANTED");
  });

  it("always exposes the final text via aria-label for assistive tech", () => {
    vi.useFakeTimers();
    render(<ScrambleText text="ACCESS" durationMs={200} />);

    expect(screen.getByLabelText("ACCESS")).toBeInTheDocument();
  });

  it("snaps straight to the text when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(<ScrambleText text="ONLINE" />);

    expect(screen.getByLabelText("ONLINE")).toHaveTextContent("ONLINE");
  });
});
