// vite.config.js - SIMPLIFIED
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
    // ✅ No proxy - Nginx handles everything
  },
  build: {
    outDir: "dist",
    sourcemap: false
  }
});