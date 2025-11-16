// ========================== MAIN IMPORTS ========================== //
// Node helpers plus the Vite plugins required to build the SPA.
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
              "dist/.vite/manifest.json"
            );

            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(
                fs.readFileSync(manifestPath, "utf-8")
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
      generateRobotsTxt: false, // Prevents the plugin from probing dist/ for robots.txt
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

        // Add hash only to JS and CSS — keep images and OG assets with fixed names
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.name ?? "";

          // Files that must NOT be hashed
          const fixedNames = [
            "og-image.jpg",
            "favicon.ico",
            "favicon.svg",
            "favicon-512.png",
            "apple-touch-icon.png",
            "android-chrome-192x192.png",
            "android-chrome-512x512.png",
            "mstile-150x150.png",
          ];

          if (fixedNames.includes(fileName)) {
            return `[name][extname]`;
          }

          // All other assets get hashed
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
