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
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets/images", import.meta.url)),
    },
  },
  build: { outDir: "dist", assetsDir: "assets" },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});