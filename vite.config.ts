import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  root: "src/frontend",
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({
      root: ".",
      projects: [path.resolve(__dirname, "tsconfig.app.json")],
    }),
  ],
  envDir: path.resolve(__dirname),
  server: {
    allowedHosts: true,
  },
});
