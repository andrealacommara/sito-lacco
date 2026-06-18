// ========================== MAIN IMPORTS ========================== //
// Node helpers plus the Vite plugins required to build the SPA.
import type { PreRenderedAsset } from "rollup";

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

// @ts-expect-error — loader build-time in ESM puro, niente type declarations
import { loadCatalog } from "./scripts/catalog-loader.mjs";

// Route statiche indicizzabili (curate a mano: NON include admin/presskit/unsubscribe).
// Le route delle release sono derivate dal catalog → unica fonte di verità.
const STATIC_ROUTES = [
  "/musica",
  "/chi-sono",
  "/live",
  "/contatti",
  "/newsletter",
  "/privacy",
];

export default defineConfig(async () => {
  const { catalog } = await loadCatalog();
  const releaseRoutes = catalog.map(
    (release: { slug: string }) => `/${release.slug}`,
  );
  const sitemapRoutes = [...STATIC_ROUTES, ...releaseRoutes];

  return {
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
        dynamicRoutes: sitemapRoutes,
        generateRobotsTxt: false, // Prevents the plugin from probing dist/ for robots.txt
      }),

      // Resolves path aliases defined in tsconfig.json
      tsconfigPaths(),

      // TailwindCSS integration
      tailwindcss(),

      // Import SVG files as React components
      svgr(),

      // Process only AVIF imports through imagetools so we can generate
      // compatible fallbacks (webp/jpeg) on older mobile browsers.
      // PNG/JPG/SVG imports stay as plain URLs.
      imagetools({
        include: /^[^?]+\.avif(\?.*)?$/,
        defaultDirectives: () =>
          new URLSearchParams({
            format: "avif;webp;jpeg",
          }),
      }),
    ],

    build: {
      rollupOptions: {
        output: {
          // Splits main bundles for better caching and performance
          manualChunks: {
            react: ["react", "react-dom"],
            heroui: ["@heroui/react"],
          },

          // Add hash only to JS and CSS — keep images and OG assets with fixed names
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: (assetInfo: PreRenderedAsset) => {
            const fileName = assetInfo.names[0] ?? "";

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
  };
});
