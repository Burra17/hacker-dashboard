import { describe, expect, it } from "vitest";
import type { TerminalLine } from "@/store/slices/terminalSlice";
import { lineToneClass } from "@/lib/terminal/lineTone";

const line = (partial: Partial<TerminalLine>): TerminalLine => ({
  id: "1",
  kind: "output",
  text: "x",
  ...partial,
});

describe("lineToneClass", () => {
  it("colors output by CommandResult.kind on success", () => {
    expect(lineToneClass(line({ outputKind: "ui", success: true }))).toBe("text-accent");
    expect(lineToneClass(line({ outputKind: "data", success: true }))).toBe("text-accent-2");
    expect(lineToneClass(line({ outputKind: "ai", success: true }))).toBe("text-fg");
    expect(lineToneClass(line({ outputKind: "system", success: true }))).toBe("text-muted");
  });

  it("uses the error color for any failure, regardless of kind", () => {
    expect(lineToneClass(line({ outputKind: "ui", success: false }))).toBe("text-error");
    expect(lineToneClass(line({ outputKind: "data", success: false }))).toBe("text-error");
  });

  it("renders streamed responses as primary text", () => {
    expect(lineToneClass(line({ kind: "response" }))).toBe("text-fg");
  });

  it("falls back to muted for plain output with no metadata", () => {
    expect(lineToneClass(line({}))).toBe("text-muted");
  });
});
