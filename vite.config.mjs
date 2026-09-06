import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test-setup.ts", "src/main.tsx"],
      reporter: ["text", "html", "lcov"],
      // Full line/function coverage; defensive DOM lifecycle guards can be unreachable in jsdom.
      thresholds: { lines: 100, functions: 100, statements: 98, branches: 95 },
    },
  },
});
