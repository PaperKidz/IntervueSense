import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true, // 👈 Important for Docker/Windows
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});