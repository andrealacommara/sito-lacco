import bellaAlBuioArtwork from "@/assets/images/artworks/bellaAlBuioArtwork.avif";

// ATTENZIONE: URL interno DistroKid, non documentato ufficialmente.
// Verificare che funzioni prima dell'uscita e il giorno stesso.
// Fallback: streamingLinks.hyperfollow (apre la pagina Hyperfollow standard).
const BELLA_AL_BUIO_PRESAVE =
  "https://distrokid.com/spotify/auth/?action=hyperfollow&artistNameShortcut=lacco&albumIdShortcut=bella-al-buio";

// Slug già usati da route esistenti del sito — una release non può usarli.
// Aggiornare se si aggiungono nuove route.
export const RESERVED_SLUGS = [
  "la-mia-musica",
  "su-di-me",
  "contatti",
  "presskit",
  "newsletter",
  "iscriviti",
  "confirm",
  "unsubscribe",
  "admin",
];

export type Release = {
  slug: string;
  title: string;
  artistName: string;
  releaseDate: Date;
  // Override manuale: impostare a false dopo che la release è live.
  // Non dipende dalla data per evitare problemi di fuso orario e slittamenti.
  presaveMode: boolean;
  artwork: string | object;
  ogImage: string;
  description: string;
  distrokidHyperfollow: string;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    hyperfollow?: string;
  };
};

export const releases: Release[] = [
  {
    slug: "bella-al-buio",
    title: "Bella al buio",
    artistName: "Lacco",
    releaseDate: new Date("2026-07-03T00:00:00+02:00"),
    presaveMode: true, // ← girare a false dopo uscita, aggiungere streamingLinks
    artwork: bellaAlBuioArtwork,
    ogImage: "/og-bella-al-buio.jpg",
    description:
      "Il nuovo singolo di Lacco. «bella al buio» racconta l'incontro tra due fragilità che si sfiorano nella notte — pop-punk, vulnerabilità autentica.",
    distrokidHyperfollow: BELLA_AL_BUIO_PRESAVE,
    streamingLinks: {
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/bella-al-buio",
      // spotify: 'https://open.spotify.com/track/...',    // popolare dopo uscita
      // appleMusic: 'https://music.apple.com/...',
    },
  },
];

export function getReleaseBySlug(slug: string): Release | undefined {
  return releases.find((r) => r.slug === slug);
}

export function getReleaseSlugList(): string[] {
  return releases.map((r) => r.slug);
}
