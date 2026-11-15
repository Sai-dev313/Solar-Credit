import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  // The edge-function module imported by the demo backend lives outside web/; make it
  // use this app's copy of ethers instead of bundling a second one.
  resolve: { alias: { ethers: fileURLToPath(new URL("./node_modules/ethers", import.meta.url)) } },
  // PGlite (the offline demo database) ships its own wasm; it must not be pre-bundled.
  optimizeDeps: { exclude: ["@electric-sql/pglite"] },
  server: { fs: { allow: [".."] } },
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
});
