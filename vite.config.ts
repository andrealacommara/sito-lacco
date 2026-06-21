// ========================== MAIN IMPORTS ========================== //
// Node helpers plus the Vite plugins required to build the SPA.
import fs from "fs";
import path from "path";

import { defineConfig, type Rolldown } from "vite";
import react from "@vitejs/plugin-react";
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

      // TailwindCSS integration
      tailwindcss(),

      // Import SVG files as React components
      svgr(),

      // imagetools processa:
      //  1) tutti gli import .avif (artwork, poster, press kit) → fallback webp/jpeg
      //  2) qualunque immagine con direttive esplicite (?w=, ?format=…), così la
      //     gallery dei live può caricare JPEG pesanti ma servire una versione
      //     leggera e multi-formato.
      // Gli import `?url` sono esclusi: servono l'originale intatto (download).
      // PNG/JPG senza direttive restano URL semplici.
      imagetools({
        include: [/^[^?]+\.avif(\?.*)?$/, /[?&](w|h|format|quality)=/],
        exclude: /[?&]url\b/,
        defaultDirectives: () =>
          new URLSearchParams({
            format: "avif;webp;jpeg",
          }),
      }),
    ],

    resolve: {
      tsconfigPaths: true,
    },

    build: {
      chunkSizeWarningLimit: 650,
      rolldownOptions: {
        checks: {
          pluginTimings: false,
        },
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /node_modules\/(react|react-dom)/,
                priority: 20,
              },
              { name: "heroui", test: /node_modules\/@heroui/, priority: 10 },
            ],
          },
          // Add hash only to JS and CSS — keep images and OG assets with fixed names
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: (assetInfo: Rolldown.PreRenderedAsset) => {
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
