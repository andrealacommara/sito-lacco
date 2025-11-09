import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import VitePluginSitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    // Supporto React con fast refresh
    react(),

    // Generazione sitemap per SEO
    VitePluginSitemap({
      hostname: "https://lacco.it",
      dynamicRoutes: ["/la-mia-musica", "/su-di-me", "/contatti"],
    }),

    // Risoluzione dei path definiti in tsconfig.json
    tsconfigPaths(),

    // Integrazione TailwindCSS
    tailwindcss(),

    // Import SVG come componenti React
    svgr(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Suddivisione dei bundle principali per caching ottimizzato
        manualChunks: {
          react: ["react", "react-dom"],
          ui: ["@heroui/react"],
        },

        // Hash solo per JS e CSS, mantiene immagini e OG con nomi fissi
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          // File immagine (png, jpg, svg, avif, gif, webp) restano senza hash
          if (/\.(png|jpe?g|svg|gif|avif|webp)$/i.test(assetInfo.name ?? "")) {
            return `assets/[name][extname]`;
          }
          // Tutti gli altri asset (CSS ecc.) ricevono hash
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
