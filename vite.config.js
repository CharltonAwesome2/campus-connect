import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  base: "/campus-connect/",
  server: { port: 5173 },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
    },
  },
  build: { outDir: "dist", assetsDir: "assets" },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});