import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Test config kept separate from vite.config.ts.
 *
 * The app config sets `root: client/`, which would hide server tests from the
 * runner, and its PWA/JSX-loc plugins are pure overhead under jsdom.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/test/setup.ts"],
    include: ["{client,server,shared}/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Generated UI primitives and type-only files carry no logic worth covering.
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "client/src/components/ui/**",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
});
