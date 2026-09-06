import { defineConfig } from "vitest/config";
export default defineConfig({
  // Stop Vite searching upward into the sibling project's PostCSS config.
  css: { postcss: { plugins: [] } },
  test: { include: ["test/**/*.test.ts"], testTimeout: 15_000 },
});
