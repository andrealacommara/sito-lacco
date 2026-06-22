// Sorgente UNICA delle route indicizzabili del sito, condivisa da:
//   - vite.config.ts        → dynamicRoutes del sitemap
//   - scripts/prerender.mjs → elenco delle pagine da snapshottare
//
// Le route delle release e dei live sono derivate dalle rispettive fonti di
// verità (catalog.ts, liveEvents.data.ts), così sitemap e prerender non vanno
// mai in drift. Le pagine `noindex` (admin/presskit/unsubscribe/404) sono
// volutamente escluse.
import { loadCatalog } from "./catalog-loader.mjs";
import { loadLiveEvents } from "./events-loader.mjs";

// Route statiche indicizzabili curate a mano (NON admin/presskit/unsubscribe).
export const STATIC_ROUTES = [
  "/musica",
  "/chi-sono",
  "/live",
  "/contatti",
  "/newsletter",
  "/privacy",
];

// Route dinamiche derivate dal catalog (release) e dai live.
async function getDynamicRoutes() {
  const { catalog } = await loadCatalog();
  const { liveEventsData } = await loadLiveEvents();

  const releaseRoutes = catalog.map((release) => `/${release.slug}`);
  const eventRoutes = liveEventsData.map((event) => `/live/${event.slug}`);

  return [...releaseRoutes, ...eventRoutes];
}

// Route per il sitemap: statiche + dinamiche, SENZA "/" (vite-plugin-sitemap
// aggiunge da sé la homepage).
export async function getSitemapRoutes() {
  return [...STATIC_ROUTES, ...(await getDynamicRoutes())];
}

// Tutte le route indicizzabili da prerenderizzare: home + statiche + dinamiche.
export async function getAllRoutes() {
  return ["/", ...STATIC_ROUTES, ...(await getDynamicRoutes())];
}

// Contenuti dinamici CON metadati (titolo/data), per chi deve generare label
// leggibili e non solo path — es. scripts/generate-llms.mjs. Stessa fonte di
// verità delle route, così llms.txt non va mai in drift con sitemap/prerender.
export async function getContentEntries() {
  const { catalog } = await loadCatalog();
  const { liveEventsData } = await loadLiveEvents();

  const releases = catalog.map((release) => ({
    url: `/${release.slug}`,
    title: release.title,
    kind: release.kind,
    year: release.year,
    date: release.releaseDate,
  }));

  const events = liveEventsData.map((event) => ({
    url: `/live/${event.slug}`,
    title: event.title,
    date: event.date,
    venue: event.venue,
    city: event.city,
  }));

  return { releases, events };
}
