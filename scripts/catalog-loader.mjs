// Carica src/config/catalog.ts in un contesto Node bundlando con esbuild.
// Gli import di asset immagine sono sostituiti con il loro basename (stringa),
// così `artwork` diventa il nome-file e nessun modulo React/Vite entra nel bundle.
//
// Usato a build-time sia da generate-og-images.js (genera le OG) sia da
// vite.config.ts (deriva le route del sitemap): il catalog è l'unica fonte di verità.
import path from "path";
import esbuild from "esbuild";

export async function loadCatalog() {
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
      contents: `export { catalog, singles, albums } from "@/config/catalog";`,
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
