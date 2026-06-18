import { albums, getReleaseBySlug, singles } from "@/config/catalog";

// Risolutore unificato della route dinamica /:slug (ri-esportato dal catalog).
export { getReleaseBySlug };
export type { Release } from "@/config/catalog";

// Slug già usati da route statiche — una release non può usarli.
export const RESERVED_SLUGS = [
  "musica",
  "chi-sono",
  "contatti",
  "presskit",
  "newsletter",
  "iscriviti",
  "confirm",
  "unsubscribe",
  "admin",
  "live",
  "privacy",
];

export function getSongSlugList(): string[] {
  return singles.map((s) => s.slug);
}

export function getAlbumSlugList(): string[] {
  return albums.map((a) => a.slug);
}

// Guardia di collisione in dev: reserved e slug delle release non devono sovrapporsi.
if (import.meta.env.DEV) {
  const seen = new Map<string, string>();
  const check = (slug: string, source: string) => {
    const existing = seen.get(slug);

    if (existing) {
      console.warn(
        `[slugs] collisione sullo slug "${slug}": presente sia in ${existing} che in ${source}.`,
      );
    } else {
      seen.set(slug, source);
    }
  };

  RESERVED_SLUGS.forEach((s) => check(s, "RESERVED_SLUGS"));
  getSongSlugList().forEach((s) => check(s, "singoli"));
  getAlbumSlugList().forEach((s) => check(s, "album"));
}
