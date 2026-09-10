import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 纯静态站点：base 用相对路径，配合 HashRouter 可直接丢到 GitHub Pages 任意子路径下。
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
