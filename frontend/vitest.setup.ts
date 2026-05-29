// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.) and
// registers their TypeScript augmentation for the whole test suite.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees between tests so rendered DOM doesn't leak across cases.
afterEach(() => cleanup());

// jsdom doesn't implement scrollIntoView; components that auto-scroll (e.g. the
// terminal) call it on mount, so provide a no-op stub.
Element.prototype.scrollIntoView = () => {};
