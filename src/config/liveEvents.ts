import type { ImageLikeImport } from "@/components/smartImage";

import tempoPersoLIVEPoster from "@/assets/images/liveEvents/tempoPersoLIVEPoster.avif";

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
};

export const liveEvents: LiveEvent[] = [
  {
    slug: "torino-11-luglio-2026",
    title: "INTO THE LACCOVERSE",
    date: new Date("2026-07-11T21:00:00"),
    doorsTime: "20:00",
    venue: "CPG Torino",
    address: "Strada delle Cacce, 36, 10135 Torino (TO)",
    city: "Torino",
    ticketUrl: "https://www.mailticket.it/evento/53852/lacco",
    price: "€10 + prevendita (€15 in cassa)",
    lineup: ["SCA", "Tommiottocento"],
  },
  {
    slug: "torino-30-gennaio-2026",
    title: "Tempo perso LIVE",
    date: new Date("2026-01-30T21:00:00"),
    doorsTime: "20:00",
    venue: "CPG Torino",
    address: "Strada delle Cacce, 36, 10135 Torino (TO)",
    city: "Torino",
    ticketUrl: "https://www.mailticket.it/evento/50837/lacco",
    poster: tempoPersoLIVEPoster,
    price: "€10 + prevendita",
    lineup: ["SCA"],
  },
];

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
