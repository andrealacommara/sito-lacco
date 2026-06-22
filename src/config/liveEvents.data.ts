// Dati editoriali "puri" dei live: nessun import di asset né `import.meta.glob`,
// così questo file è caricabile anche in contesto Node (build-time) tramite
// esbuild — vedi scripts/events-loader.mjs. Poster e gallery vengono agganciati
// da liveEvents.ts leggendo le cartelle degli asset.
//
// Aggiungere un evento qui è l'unica fonte di verità per slug/date/biglietti:
// da qui derivano sia la pagina live sia il sitemap/prerender.

// Campi dell'evento esclusi poster/gallery (agganciati altrove dai file su disco).
export type LiveEventData = {
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
  // Campi "recap", popolati dopo il live (vedi EventPage in modalità passato).
  description?: string; // racconto del live (\n per i paragrafi)
  recapVideoIds?: string[]; // ID dei video YouTube
};

export const liveEventsData: LiveEventData[] = [
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
