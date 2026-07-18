// Genera dist/llms.txt: l'indice in Markdown che gli LLM/crawler usano per capire
// la struttura del sito (standard llms.txt — https://llmstxt.org).
//
// È generato a build-time dalla STESSA fonte di verità di sitemap e prerender
// (scripts/routes.mjs → catalog.ts + liveEvents.data.ts), così le pagine con
// slug (release `/<slug>`, live `/live/<slug>`) ci sono sempre e non vanno mai
// in drift. Gira nel postbuild, dopo che dist/ esiste.
import path from "path";
import fs from "fs";

import { STATIC_ROUTES, getContentEntries } from "./routes.mjs";

const HOSTNAME = "https://www.lacco.it";
const OUTPUT_PATH = path.join("dist", "llms.txt");

// Label + descrizione per le route statiche indicizzabili (vedi STATIC_ROUTES).
const STATIC_LABELS = {
  "/musica": { label: "Musica", desc: "discografia, singoli e release." },
  "/chi-sono": { label: "Chi sono", desc: "biografia e racconto dell'artista." },
  "/live": { label: "Live", desc: "eventi e concerti dal vivo." },
  "/contatti": { label: "Contatti", desc: "informazioni di contatto e richieste." },
  "/newsletter": {
    label: "Newsletter",
    desc: "iscrizione per restare aggiornato su uscite ed eventi.",
  },
  "/privacy": { label: "Privacy", desc: "informativa sul trattamento dei dati." },
};

// Profili canonici ufficiali dell'entità "Lacco". Wikidata/MusicBrainz per primi:
// sono le basi di conoscenza che LLM e Knowledge Graph usano per disambiguare l'artista
// (da omonimi e dal toponimo "Lacco Ameno"). MIRROR di `artistSameAs` in src/config/site.ts.
const OFFICIAL_PROFILES = [
  ["Wikidata", "https://www.wikidata.org/wiki/Q140420523", "scheda entità (Lacco, cantautore italiano)."],
  ["MusicBrainz", "https://musicbrainz.org/artist/9c320ba3-7904-4394-9dfd-c49a57ff0c32", "scheda artista."],
  ["Spotify", "https://open.spotify.com/artist/6viihrUFd4eGCfv9w61tL7"],
  ["Apple Music", "https://music.apple.com/it/artist/lacco/1773060241"],
  ["Amazon Music", "https://music.amazon.it/artists/B0DJV3D4GG/lacco"],
  ["YouTube", "https://www.youtube.com/@Laccoverse"],
  ["Instagram", "https://instagram.com/laccoverse"],
  ["TikTok", "https://tiktok.com/@laccoverse"],
];

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const link = (label, url, note) =>
  `- [${label}](${HOSTNAME}${url})${note ? `: ${note}` : ""}`;

const { releases, events } = await getContentEntries();

// Release: più recenti prima.
const releaseLinks = [...releases]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map((r) => link(r.title, r.url, `${r.kind}, ${r.year}.`));

// Live: cronologico.
const eventLinks = [...events]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map((e) =>
    link(
      e.title,
      e.url,
      `concerto live ${e.venue}, ${e.city} — ${dateFmt.format(new Date(e.date))}.`,
    ),
  );

const profileLinks = OFFICIAL_PROFILES.map(
  ([label, url, note]) => `- [${label}](${url})${note ? `: ${note}` : ""}`,
);

const sections = [
  "# Lacco",
  "",
  "> Lacco è un cantante e cantautore italiano (Pop, R&B, Hip-Hop). Per chi sente più di quanto riesca a dire. Sito ufficiale con musica, eventi live, newsletter e contatti. Da non confondere con la località Lacco Ameno né con altri artisti dal nome simile.",
  "",
  "## Profili ufficiali",
  "",
  ...profileLinks,
  "",
  "## Pagine principali",
  "",
  link("Home", "/", "pagina principale del sito ufficiale di Lacco."),
  ...STATIC_ROUTES.filter((r) => STATIC_LABELS[r]).map((r) =>
    link(STATIC_LABELS[r].label, r, STATIC_LABELS[r].desc),
  ),
  "",
  "## Musica",
  "",
  ...releaseLinks,
  "",
  "## Live",
  "",
  ...eventLinks,
  "",
];

fs.writeFileSync(OUTPUT_PATH, sections.join("\n") + "\n", "utf-8");

console.log(
  `llms.txt → ${OUTPUT_PATH} (${releaseLinks.length} release, ${eventLinks.length} live)`,
);
