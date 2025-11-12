import fs from "fs";
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import VitePluginSitemap from "vite-plugin-sitemap";
import { imagetools } from "vite-imagetools";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  plugins: [
    // React support with Fast Refresh
    react(),
    // HTML preload CSS
    createHtmlPlugin({
      minify: true,
      inject: {
        data: (() => {
          let entryCss = "";
          let entryJs = "";
          let preloadCss = false;
          let preloadJs = false;

          try {
            const manifestPath = path.resolve(
              __dirname,
              "dist/.vite/manifest.json",
            );

            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(
                fs.readFileSync(manifestPath, "utf-8"),
              );
              const main = manifest["src/main.tsx"];

              if (main && main.css && main.css.length) {
                entryCss = `/${main.css[0].replace(/^\//, "")}`;
                preloadCss = true;
              }

              if (main && main.file) {
                entryJs = `/${main.file.replace(/^\//, "")}`;
                preloadJs = true;
              }
            }
          } catch {
            /* fallback */
          }

          return {
            preloadCss,
            preloadJs,
            entryCss,
            entryJs,
          };
        })(),
      },
    }),
    // Automatic sitemap generation for SEO
    VitePluginSitemap({
      hostname: "https://lacco.it",
      dynamicRoutes: ["/la-mia-musica", "/su-di-me", "/contatti"],
    }),

    // Resolves path aliases defined in tsconfig.json
    tsconfigPaths(),

    // TailwindCSS integration
    tailwindcss(),

    // Import SVG files as React components
    svgr(),

    // Creates optimized variants for each image
    imagetools(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Splits main bundles for better caching and performance
        manualChunks: {
          react: ["react", "react-dom"],
        },

        // Add hash only to JS and CSS files — keep images and OG assets with fixed names
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          // Keep image files (png, jpg, svg, avif, gif, webp) without hash for stable URLs
          if (/\.(png|jpe?g|svg|gif|avif|webp)$/i.test(assetInfo.name ?? "")) {
            return `assets/[name][extname]`;
          }

          // Apply hash to all other assets (e.g., CSS)
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
