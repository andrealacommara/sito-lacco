// Prerendering SEO: per ogni route indicizzabile genera uno snapshot HTML statico
// con i tag dell'<head> (title, description, Open Graph, canonical, JSON-LD) già
// "cotti" dentro. Così Google e i crawler social (che NON eseguono JS) vedono i
// tag personalizzati di ogni slug, non quelli generici della homepage.
//
// Come funziona:
//   1. avvia il server `vite preview` sulla cartella dist/ (con SPA fallback);
//   2. con Playwright visita ogni route, aspetta il mount di React + Helmet;
//   3. cattura l'HTML renderizzato e lo scrive in dist/<route>/index.html.
//
// L'app resta una SPA: questi snapshot servono ai crawler, il client si rimonta
// normalmente (createRoot). Le pagine noindex non sono prerenderizzate.
import path from "path";
import fs from "fs";

import { preview } from "vite";
import { chromium } from "playwright";

import { getAllRoutes, STATIC_ROUTES } from "./routes.mjs";

const OUTPUT_DIR = "dist";

// Route immersive sempre a barra scura (release /:slug ed eventi /live/:slug):
// sono tutte e sole quelle dinamiche, cioè NON statiche e non la home.
const staticSet = new Set(["/", ...STATIC_ROUTES]);
const isForcedDark = (route) => !staticSet.has(route);

// dist/index.html per "/", altrimenti dist/<route>/index.html.
function outputPathFor(route) {
  if (route === "/") return path.join(OUTPUT_DIR, "index.html");

  return path.join(OUTPUT_DIR, route.replace(/^\//, ""), "index.html");
}

const routes = await getAllRoutes();

// 1) Server di anteprima sulla build (SPA fallback gestito da vite preview).
const server = await preview({
  preview: { port: 4178, strictPort: false },
  logLevel: "warn",
});
const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, "");

if (!baseUrl) {
  await server.close();
  throw new Error("Impossibile determinare l'URL del server di anteprima.");
}

console.log(`Prerender: ${routes.length} route da ${baseUrl}`);

// 2) Cattura tutti gli snapshot in memoria (così non serviamo file appena
//    scritti durante il giro: ogni route viene resa dalla SPA "fresca").
let browser;
const snapshots = [];

try {
  browser = await chromium.launch();
  const page = await browser.newPage();

  for (const route of routes) {
    const url = `${baseUrl}${route}`;

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    // Attende il mount di React (root popolato); Helmet applica i tag negli effetti.
    await page.waitForFunction(
      () => (document.getElementById("root")?.childElementCount ?? 0) > 0,
      { timeout: 15000 },
    );
    // Margine per il flush dell'head da parte di react-helmet-async.
    await page.waitForTimeout(300);

    // Pulizia snapshot:
    //  - rimuove data-theme "cotto" dall'ambiente di build (lo script inline in
    //    index.html lo ricalcola lato client prima del paint);
    //  - deduplica i tag SEO: index.html ne contiene di statici (default) e
    //    react-helmet-async ne appende di per-pagina. Senza dedup la pagina ha
    //    due <title> e doppi og:* e i crawler usano quello generico sbagliato.
    await page.evaluate((forcedDark) => {
      const head = document.head;

      document.documentElement.removeAttribute("data-theme");

      // Rimuovi i <link rel=modulepreload|preload|prefetch> con href ASSOLUTO:
      // il warming delle route (App idle) inietta a runtime preload dei chunk e
      // a partire da vite 8.1.0 questi usano l'origine assoluta del server di
      // prerender (es. http://localhost:4178/assets/…), che finirebbe cotta
      // nello snapshot statico e fallirebbe in produzione/smoke test. I preload
      // legittimi emessi da vite nella index.html hanno href root-relative
      // (/assets/…) e vengono preservati.
      for (const link of head.querySelectorAll(
        'link[rel="modulepreload"], link[rel="preload"], link[rel="prefetch"]',
      )) {
        const href = link.getAttribute("href") || "";
        if (/^https?:\/\//i.test(href)) link.remove();
      }

      // Slug immersive: "cuoci" il colore barra forzato così lo script inline di
      // index.html (e il sync runtime) lo applicano dal primo paint, evitando la
      // banda bianca per gli utenti con preferenza di sistema chiara.
      if (forcedDark) {
        document.documentElement.setAttribute(
          "data-force-theme-color",
          "#000000",
        );

        const themeMeta = head.querySelector('meta[name="theme-color"]');

        if (themeMeta) themeMeta.setAttribute("content", "#000000");
      }

      // <title>: tieni quello che corrisponde a document.title (impostato da
      // Helmet), con fallback al primo; rimuovi gli altri.
      const titles = [...head.querySelectorAll("title")];
      const keepTitle =
        titles.find((t) => t.textContent === document.title) ?? titles[0];

      for (const t of titles) if (t !== keepTitle) t.remove();

      // meta[name|property] e link[rel=canonical]: tieni l'ULTIMA occorrenza
      // (Helmet appende in fondo), rimuovi i duplicati statici precedenti.
      const keyOf = (el) => {
        if (el.tagName === "META") {
          const k = el.getAttribute("name") || el.getAttribute("property");

          return k ? `meta:${k}` : null;
        }
        if (el.tagName === "LINK" && el.getAttribute("rel") === "canonical") {
          return "link:canonical";
        }

        return null;
      };

      const seen = new Set();

      for (const el of [...head.children].reverse()) {
        const key = keyOf(el);

        if (!key) continue;
        if (seen.has(key)) el.remove();
        else seen.add(key);
      }
    }, isForcedDark(route));

    // page.content() include già <!DOCTYPE html>.
    const html = await page.content();

    snapshots.push({ route, html });
    console.log(`  ✓ ${route}`);
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}

// 3) Scrive gli snapshot su disco.
for (const { route, html } of snapshots) {
  const outPath = outputPathFor(route);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf-8");
}

console.log(`\nPrerender → dist/ (${snapshots.length} pagine)`);
