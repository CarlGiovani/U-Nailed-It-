import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/", // 🔥 IMPORTANT FOR RENDER + SPA ROUTING
});
