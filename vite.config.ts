import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import VitePluginSitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    VitePluginSitemap({
      hostname: "https://lacco.it",
      dynamicRoutes: ["/la-mia-musica", "/su-di-me", "/contatti"],
    }),
    tsconfigPaths(),
    tailwindcss(),
    svgr(),
  ],
  build: {
    assetsDir: "",
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        manualChunks: {
          react: ["react", "react-dom"],
          ui: ["@heroui/react"],
        },
      },
    },
  },
});
