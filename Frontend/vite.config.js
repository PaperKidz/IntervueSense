import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // ✅ allows access from network & Nginx
    // No proxy needed - Nginx handles everything
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});