import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// resolve.tsconfigPaths maps the "@/*" and "@contracts/*" aliases from tsconfig.json
// (Vite-native), so tests import modules exactly like app code does.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
});
