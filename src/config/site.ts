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
    youtube: "https://www.youtube.com/@Laccoverse",
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
  "https://instagram.com/laccoverse",
  "https://tiktok.com/@laccoverse",
  "https://www.youtube.com/@Laccoverse",
];
