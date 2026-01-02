import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.tsx"],
    include: ["tests/**/*.spec.{ts,tsx}"],
    exclude: ["tests/e2e/**"],

    // 🧩 nécessaire pour que les mocks Recharts soient bien appliqués
    deps: {
      optimizer: {
        web: {
          include: ["recharts"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
