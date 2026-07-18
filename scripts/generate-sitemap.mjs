// Genera dist/sitemap.xml dalla STESSA fonte di verità di prerender e llms.txt
// (scripts/routes.mjs → catalog.ts + liveEvents.data.ts), così non va mai in
// drift. Sostituisce vite-plugin-sitemap per avere pieno controllo su:
//   - lastmod REALI per contenuto (data uscita release / data evento), invece
//     di un timestamp di build identico ovunque (segnale di freschezza credibile);
//   - priority / changefreq differenziati per tipo di pagina;
//   - voci <image:image> per release ed eventi (Google Immagini).
//
// Gira nel postbuild, dopo che dist/ e le OG (og-<slug>.jpg) esistono.
import path from "path";
import fs from "fs";

import { STATIC_ROUTES, getContentEntries } from "./routes.mjs";

const HOSTNAME = "https://www.lacco.it";
const OUTPUT_PATH = path.join("dist", "sitemap.xml");
const DIST_DIR = "dist";

// Data → "YYYY-MM-DD" (W3C datetime valido per <lastmod>).
const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

// Metadati per pagina statica: priority + changefreq. lastmod è derivato dai
// contenuti (vedi sotto) solo per /musica e /live; le altre sono stabili.
const STATIC_META = {
  "/musica": { priority: "0.9", changefreq: "weekly" },
  "/live": { priority: "0.9", changefreq: "weekly" },
  "/chi-sono": { priority: "0.6", changefreq: "yearly" },
  "/contatti": { priority: "0.5", changefreq: "yearly" },
  "/newsletter": { priority: "0.5", changefreq: "yearly" },
  "/privacy": { priority: "0.3", changefreq: "yearly" },
};

const { releases, events } = await getContentEntries();

// Data del contenuto più recente per sezione (per i lastmod delle pagine indice).
const latest = (items) =>
  items.length
    ? items.reduce((max, it) => (new Date(it.date) > new Date(max) ? it.date : max), items[0].date)
    : null;

const latestRelease = latest(releases);
const latestEvent = latest(events);
const latestOverall = [latestRelease, latestEvent]
  .filter(Boolean)
  .sort((a, b) => new Date(b) - new Date(a))[0];

// OG immagine assoluta se il file esiste in dist/ (release: sempre; eventi: solo
// quelli con poster, generati da generate-og-events.mjs).
const ogImageFor = (slug) => {
  const file = `og-${slug}.jpg`;
  return fs.existsSync(path.join(DIST_DIR, file)) ? `${HOSTNAME}/${file}` : null;
};

// Costruisce un blocco <url>. `image` opzionale.
function urlEntry({ loc, lastmod, priority, changefreq, image }) {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  if (image) {
    lines.push(`    <image:image>`, `      <image:loc>${image}</image:loc>`, `    </image:image>`);
  }
  lines.push(`  </url>`);
  return lines.join("\n");
}

const entries = [];

// Home — forma canonica con slash finale.
entries.push(
  urlEntry({
    loc: `${HOSTNAME}/`,
    lastmod: latestOverall ? isoDate(latestOverall) : undefined,
    priority: "1.0",
    changefreq: "weekly",
  }),
);

// Pagine statiche.
for (const route of STATIC_ROUTES) {
  const meta = STATIC_META[route] ?? { priority: "0.5", changefreq: "yearly" };
  let lastmod;
  if (route === "/musica" && latestRelease) lastmod = isoDate(latestRelease);
  if (route === "/live" && latestEvent) lastmod = isoDate(latestEvent);
  entries.push({ loc: `${HOSTNAME}${route}`, lastmod, ...meta });
}

// Release.
for (const r of releases) {
  entries.push({
    loc: `${HOSTNAME}${r.url}`,
    lastmod: isoDate(r.date),
    priority: "0.8",
    changefreq: "monthly",
    image: ogImageFor(r.url.replace(/^\//, "")),
  });
}

// Eventi live.
for (const e of events) {
  entries.push({
    loc: `${HOSTNAME}${e.url}`,
    lastmod: isoDate(e.date),
    priority: "0.7",
    changefreq: "monthly",
    image: ogImageFor(e.url.replace(/^\/live\//, "")),
  });
}

// Le statiche/release/eventi sono ancora oggetti: convertiamo (la home è già stringa).
const body = entries.map((e) => (typeof e === "string" ? e : urlEntry(e))).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;

fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");

console.log(
  `sitemap.xml → ${OUTPUT_PATH} (1 home + ${STATIC_ROUTES.length} statiche + ${releases.length} release + ${events.length} live)`,
);
