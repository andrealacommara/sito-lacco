// Carica src/config/liveEvents.data.ts in un contesto Node bundlando con esbuild.
// Il file dei dati è puro (niente import.meta.glob né asset), ma riusiamo lo
// stesso stub asset di catalog-loader per robustezza nel caso venga aggiunto un
// import immagine in futuro.
//
// Usato a build-time da scripts/routes.mjs (route del sitemap/prerender) e da
// scripts/generate-og-events.mjs (OG per evento). Fonte di verità: liveEvents.data.ts.
import path from "path";

import esbuild from "esbuild";

export async function loadLiveEvents() {
  const assetStub = {
    name: "asset-basename",
    setup(build) {
      build.onResolve({ filter: /\.(avif|png|jpe?g|webp|svg)$/ }, (args) => ({
        path: args.path,
        namespace: "asset-stub",
      }));
      build.onLoad({ filter: /.*/, namespace: "asset-stub" }, (args) => ({
        contents: `export default ${JSON.stringify(path.basename(args.path))};`,
        loader: "js",
      }));
    },
  };

  const bundle = await esbuild.build({
    stdin: {
      contents: `export { liveEventsData } from "@/config/liveEvents.data";`,
      resolveDir: process.cwd(),
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    alias: { "@": path.resolve("src") },
    define: { "import.meta.env.DEV": "false" },
    plugins: [assetStub],
  });

  const dataUrl =
    "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].text).toString("base64");

  return import(dataUrl);
}
