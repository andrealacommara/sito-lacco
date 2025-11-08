// ========================== TIPO DI CONFIGURAZIONE ========================== //

// Definisce un tipo TypeScript che rappresenta la struttura dell’oggetto `siteConfig`.
// Questo permette di utilizzare `SiteConfig` come tipo ovunque nel progetto,
// garantendo coerenza e completamento automatico da parte dell’IDE.
export type SiteConfig = typeof siteConfig;

// ========================== CONFIGURAZIONE DEL SITO ========================== //

// Oggetto principale che contiene i metadati e le impostazioni globali del sito.
// Include nome, descrizione, elementi di navigazione e link esterni.
export const siteConfig = {
  // Nome del progetto o del brand
  name: "Lacco",

  // Breve descrizione del sito, utilizzata per SEO o condivisione social
  description: "Scopri Lacco, la sua musica e ciò che la ispira!",

  // ========================== NAVBAR PRINCIPALE ========================== //
  // Elementi visualizzati nella barra di navigazione desktop
  navItems: [
    { label: "Home", href: "/" },
    { label: "La mia musica", href: "/la-mia-musica" },
    { label: "Su di me", href: "/su-di-me" },
    { label: "Contatti", href: "/contatti" },
  ],

  // ========================== MENU MOBILE ========================== //
  // Elementi visualizzati nel menu a tendina (mobile)
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "La mia musica", href: "/la-mia-musica" },
    { label: "Su di me", href: "/su-di-me" },
    { label: "Contatti", href: "/contatti" },
  ],

  // ========================== LINK ESTERNI ========================== //
  // Collegamenti ufficiali alle piattaforme musicali e ai social di Lacco
  links: {
    spotify:
      "https://open.spotify.com/intl-it/artist/6viihrUFd4eGCfv9w61tL7?si=CDBCI2pYT2axereXjLHUJA",
    tiktok: "https://tiktok.com/@laccoverse",
    instagram: "https://instagram.com/laccoverse",
    appleMusic: "https://music.apple.com/it/artist/lacco/1773060241",
    youtube: "https://www.youtube.com/@Laccoverse",
  },
};
