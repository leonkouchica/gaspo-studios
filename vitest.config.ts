/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", "dist", ".vercel", ".tanstack"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/data/**", "src/lib/**"],
      exclude: ["node_modules"],
    },
    reporters: ["verbose"],
  },
});
