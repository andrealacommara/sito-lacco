import type { ImageLikeImport } from "@/components/smartImage";

// Foto del live: `src` è la versione leggera (ottimizzata) mostrata a video,
// `downloadUrl` è il file originale nella cartella (scaricato dal lightbox).
export type LiveEventPhoto = {
  src: ImageLikeImport;
  downloadUrl: string;
  alt: string;
};

export type LiveEvent = {
  slug: string;
  title: string;
  date: Date; // show start — target of the Countdown
  doorsTime?: string;
  venue: string;
  address?: string;
  city: string;
  ticketUrl: string;
  price?: string;
  lineup?: string[];
  poster?: ImageLikeImport;
  // Campi "recap", popolati dopo il live (vedi EventPage in modalità passato).
  description?: string; // racconto del live (\n per i paragrafi)
  gallery?: LiveEventPhoto[];
  recapVideoIds?: string[]; // ID dei video YouTube
};

// ============================================================================
// Asset caricati per cartella (drop & go), niente import manuali. Puoi usare
// JPEG pesanti: a video va una versione leggera (ottimizzata + multi-formato),
// mentre il lightbox permette di scaricare il file originale.
//   Poster:  src/assets/images/liveEvents/<slug>/poster.{jpg,avif,…}
//   Gallery: src/assets/images/liveEvents/<slug>/gallery/*.{jpg,avif,…}
// Basta trascinare i file nella cartella dell'evento.
// ============================================================================
// Poster: versione ottimizzata (max 1200px) per non caricare il JPEG pieno.
const posterModules = import.meta.glob<ImageLikeImport>(
  "../assets/images/liveEvents/*/poster.{avif,jpg,jpeg,png}",
  { eager: true, import: "default", query: "?w=1200" },
);
// Gallery — `src`: versione leggera per la visione; `downloadUrl`: file originale.
const galleryDisplay = import.meta.glob<ImageLikeImport>(
  "../assets/images/liveEvents/*/gallery/*.{avif,jpg,jpeg,png}",
  { eager: true, import: "default", query: "?w=1600" },
);
const galleryOriginal = import.meta.glob<string>(
  "../assets/images/liveEvents/*/gallery/*.{avif,jpg,jpeg,png}",
  { eager: true, import: "default", query: "?url" },
);

// Da ".../liveEvents/<slug>/..." estrae <slug>.
function slugFromPath(p: string): string {
  return p.split("/liveEvents/")[1]?.split("/")[0] ?? "";
}

const posterBySlug: Record<string, ImageLikeImport> = {};

for (const [p, mod] of Object.entries(posterModules)) {
  posterBySlug[slugFromPath(p)] = mod;
}

function galleryFor(slug: string, title: string): LiveEventPhoto[] {
  return Object.keys(galleryDisplay)
    .filter((p) => slugFromPath(p) === slug)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((p, i) => ({
      src: galleryDisplay[p],
      downloadUrl: galleryOriginal[p],
      alt: `${title} — foto ${i + 1}`,
    }));
}

// Dati editoriali dell'evento. Poster e gallery vengono agganciati dai file.
type LiveEventInput = Omit<LiveEvent, "poster" | "gallery">;

const liveEventsInput: LiveEventInput[] = [
  {
    slug: "into-the-laccoverse",
    title: "INTO THE LACCOVERSE",
    date: new Date("2026-07-11T21:00:00"),
    doorsTime: "20:00",
    venue: "CPG Torino",
    address: "Strada delle Cacce, 36, 10135 Torino (TO)",
    city: "Torino",
    ticketUrl: "https://www.mailticket.it/evento/53852/lacco",
    price: "€10 + prevendita (€15 in cassa)",
    lineup: ["SCA", "tommiottocento"],
  },
  {
    slug: "tempo-perso-live",
    title: "Tempo perso LIVE",
    date: new Date("2026-01-30T21:00:00"),
    doorsTime: "20:00",
    venue: "CPG Torino",
    address: "Strada delle Cacce, 36, 10135 Torino (TO)",
    city: "Torino",
    ticketUrl: "https://www.mailticket.it/evento/50837/lacco",
    price: "€10 + prevendita",
    lineup: ["SCA"],
  },
];

export const liveEvents: LiveEvent[] = liveEventsInput.map((event) => ({
  ...event,
  poster: posterBySlug[event.slug],
  gallery: galleryFor(event.slug, event.title),
}));

export function getLiveEventBySlug(slug: string): LiveEvent | undefined {
  return liveEvents.find((event) => event.slug === slug);
}

export function isPastLiveEvent(event: LiveEvent): boolean {
  return event.date.getTime() <= Date.now();
}

export function getUpcomingLiveEvents(): LiveEvent[] {
  return liveEvents
    .filter((event) => event.date.getTime() > Date.now())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getPastLiveEvents(): LiveEvent[] {
  return liveEvents
    .filter((event) => event.date.getTime() <= Date.now())
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Tutti i live tranne quello indicato: prima i prossimi (più vicini), poi i passati.
export function getOtherLiveEvents(slug: string): LiveEvent[] {
  const exclude = (event: LiveEvent) => event.slug !== slug;

  return [
    ...getUpcomingLiveEvents().filter(exclude),
    ...getPastLiveEvents().filter(exclude),
  ];
}
