import { defineConfig } from "vite";
import Info from "unplugin-info/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  root: "src/frontend",
  plugins: [
    react(),
    tailwindcss(),
    Info(),
    tsconfigPaths({
      root: ".",
      projects: [path.resolve(__dirname, "tsconfig.app.json")],
    }),
  ],
  envDir: __dirname,
  server: {
    allowedHosts: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
