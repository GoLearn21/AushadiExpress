import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    testTimeout: 20000,
    env: {
      NESTAM_ENV: "test",
      SARVAM_API_KEY: "",
      NESTAM_DATA_DIR: "./.test-data",
    },
  },
});
