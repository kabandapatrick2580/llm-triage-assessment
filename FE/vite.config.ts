import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Route chunks (recharts dashboard, syntax-highlighter chat) are
    // intentionally large and lazy-loaded; raise the advisory threshold.
    chunkSizeWarningLimit: 900,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the Flask backend during development so we avoid
    // CORS issues and can use same-origin relative URLs.
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
      "/health": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
