/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 19561,
  },
  preview: {
    port: 19561,
  },
  test: {
    environment: "node",
  },
});
