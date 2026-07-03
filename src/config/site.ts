// ========================== SITE CONFIG TYPE ========================== //
// Defines a TypeScript type representing the structure of the `siteConfig` object.
// This allows `SiteConfig` to be used throughout the project for type safety and IDE autocompletion.
export type SiteConfig = typeof siteConfig;

// ========================== SITE CONFIGURATION ========================== //
// Main object containing metadata and global settings for the site.
// Includes site name, description, navigation items, and external links.
export const siteConfig = {
  // Project or brand name
  name: "Lacco",

  // ========================== MAIN NAVBAR ========================== //
  // Items shown in the desktop navigation bar
  navItems: [
    { label: "Home", href: "/" },
    { label: "Musica", href: "/musica" },
    { label: "Live", href: "/live" },
    { label: "Chi sono", href: "/chi-sono" },
    { label: "Contatti", href: "/contatti" },
  ],

  // ========================== MOBILE MENU ========================== //
  // Items shown in the dropdown menu on mobile
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "Musica", href: "/musica" },
    { label: "Live", href: "/live" },
    { label: "Chi sono", href: "/chi-sono" },
    { label: "Contatti", href: "/contatti" },
  ],

  // ========================== EXTERNAL LINKS ========================== //
  // Official links to Lacco's music platforms and social profiles
  links: {
    spotify:
      "https://open.spotify.com/intl-it/artist/6viihrUFd4eGCfv9w61tL7?si=CDBCI2pYT2axereXjLHUJA",
    tiktok: "https://tiktok.com/@laccoverse",
    instagram: "https://instagram.com/laccoverse",
    appleMusic: "https://music.apple.com/it/artist/lacco/1773060241",
    amazonMusic:
      "https://music.amazon.it/artists/B0DJV3D4GG/lacco?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_OPaDFsPTGhqbOiKBxbZ5ioI7G",
    youtube: "https://www.youtube.com/@Laccoverse",
    youtubeMusic: "https://music.youtube.com/@laccoverse?si=B5MPaEDGMMYCgmCz",
  },
};

// ========================== ARTIST ENTITY (SEO) ========================== //
// Identità unica dell'artista per la disambiguazione delle entità Schema.org.
// Lo stesso @id viene riusato in home/release/evento così Google consolida tutte
// le dichiarazioni in un'unica entità verificata (evita la confusione con omonimi).
export const ARTIST_ID = "https://lacco.it/#artist";

// URL canonici PULITI (senza parametri di tracking) dei profili ufficiali:
// è il segnale `sameAs` che lega l'entità "Lacco" ai suoi account verificati.
export const artistSameAs = [
  "https://open.spotify.com/artist/6viihrUFd4eGCfv9w61tL7",
  "https://music.apple.com/it/artist/lacco/1773060241",
  "https://music.amazon.it/artists/B0DJV3D4GG/lacco",
  "https://instagram.com/laccoverse",
  "https://tiktok.com/@laccoverse",
  "https://www.youtube.com/@Laccoverse",
  "https://music.youtube.com/@laccoverse",
];

// ===================== DISAMBIGUAZIONE ENTITÀ (vs "Lacco Ameno") ===================== //
// Segnali espliciti per dire a Google che "Lacco" qui è una PERSONA / artista italiano,
// non un toponimo (es. Lacco Ameno, Ischia). Usati nel MusicGroup/Person JSON-LD.
// IMPORTANTE: questi valori sono rispecchiati a mano anche nel MusicGroup statico di
// index.html (HTML statico, non può importare) — tenere le due copie allineate.
export const ARTIST_ALTERNATE_NAMES = ["Laccoverse"];

export const ARTIST_DISAMBIGUATION =
  "Cantante e cantautore italiano (Pop, R&B, Hip-Hop). Progetto musicale, da non confondere con la località Lacco Ameno.";

export const ARTIST_NATIONALITY = "Italia";

// Origine canonica del sito (senza slash finale), riusata per costruire URL assoluti.
export const SITE_URL = "https://lacco.it";

// ========================== BREADCRUMB JSON-LD ========================== //
// Costruisce un BreadcrumbList Schema.org per abilitare i breadcrumb nei
// risultati Google. `items` è la catena ordinata Home → … → pagina corrente;
// ogni voce è { name, path } con path relativo (es. "/musica"). L'ultima voce
// (pagina corrente) può omettere il path.
export function buildBreadcrumbJsonLd(
  items: { name: string; path?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}
