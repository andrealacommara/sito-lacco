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
