import type { ImageLikeImport } from "@/components/smartImage";

import { d } from "@/config/date";
import bellaAlBuioArtwork from "@/assets/images/artworks/bellaAlBuioArtwork.avif";
import tuxtuArtwork from "@/assets/images/artworks/tuxtuArtwork.avif";
import nokoruMonoArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";
import rumoreDiFondoArtwork from "@/assets/images/artworks/rumoreDiFondoArtwork.avif";
import cercamiArtwork from "@/assets/images/artworks/cercamiArtwork.avif";
import traLeNuvoleSVArtwork from "@/assets/images/artworks/traLeNuvoleSunsetVersionArtwork.avif";
import traLeNuvoleArtwork from "@/assets/images/artworks/traLeNuvoleArtwork.avif";
import mondoDentroArtwork from "@/assets/images/artworks/mondoDentroArtwork.avif";
import tempoPersoArtwork from "@/assets/images/artworks/tempoPersoArtwork.avif";

export type AlbumCredit = {
  label: string;
  url?: string;
};

// Campi comuni a ogni release (singolo o album).
type ReleaseBase = {
  slug: string;
  title: string;
  releaseDate: Date;
  presaveMode: boolean;
  artwork: ImageLikeImport;
  alt: string;
  ogImage: string;
  description: string;
  pressKitDescription: string;
  year: number;
  artist?: string; // default display: "Lacco" — override per feat
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    amazonMusic?: string;
    youtubeMusic?: string;
    hyperfollow?: string;
  };
};

export type Single = ReleaseBase & { kind: "Singolo" };
export type Album = ReleaseBase & {
  kind: "EP" | "Album";
  credits?: AlbumCredit[];
  trackSlugs: string[]; // ordine ufficiale dell'album, fonte di verità del legame album → tracce
};
export type Release = Single | Album;

// Compat: alias storico, una "Song" è un singolo.
export type Song = Single;

export const catalog: Release[] = [
  {
    kind: "Singolo",
    slug: "bella-al-buio",
    title: "bella al buio",
    releaseDate: d("2026-07-03"),
    presaveMode: false,
    artwork: bellaAlBuioArtwork,
    alt: "Cover artwork di 'bella al buio'",
    ogImage: "/og-bella-al-buio.jpg",
    description: `"bella al buio" racconta l'incontro tra due fragilità che si sfiorano nella notte, quando le difese cadono e restano solo le parole non dette.\nTra desiderio e distanza emotiva, il brano esplora il bisogno di connessione autentica, trasformando l'intimità in un dialogo sincero e disarmato.\nLe sonorità pop-punk moderne accompagnano un racconto emotivo fatto di dubbi, confessioni e attrazione silenziosa, trasformando la vulnerabilità in qualcosa di estremamente umano.`,
    pressKitDescription: `Un brano che racconta un dialogo intimo fatto di dubbi, verità taciute e desiderio di connessione autentica, immerso in sonorità pop-punk moderne.`,
    year: 2026,
    streamingLinks: {
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/bella-al-buio",
      spotify:
        "https://open.spotify.com/intl-it/track/39sakdCdS6STeZpXwfI86Z?si=49d6220f1d454a4c",
      appleMusic:
        "https://music.apple.com/it/album/bella-al-buio/6769377876?i=6769377877",
      amazonMusic:
        "https://music.amazon.it/albums/B0H1QHRSTX?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_svZyp4UFyUAZ6G9HO2IuwRcQy",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_k2cqnnRd1xS3j3C23XZaO6Bhw7gW0_8MI&si=iS7OFxfKg8oDFIXN",
    },
  },
  {
    kind: "Singolo",
    slug: "tu-x-tu",
    title: "tu x tu",
    releaseDate: d("2026-03-27"),
    presaveMode: false,
    artwork: tuxtuArtwork,
    alt: "Cover artwork di 'tu x tu'",
    ogImage: "/og-tu-x-tu.jpg",
    description: `"tu x tu" è il filo che ci unisce.\nUn fil rouge che accomuna le nostre paure, i nostri pensieri, rendendoci uguali.\nSeguirlo permette di riconoscerci nelle altre persone e di avvicinarci a loro.`,
    pressKitDescription: `Un brano pop/R&B che parla di connessione umana, empatia e riconoscimento reciproco.`,
    year: 2026,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/6Mi4URZPZcXVi5YiI0mGdb?si=e37446cb3ee94378",
      appleMusic: "https://music.apple.com/us/song/tu-x-tu/1879807616",
      amazonMusic:
        "https://music.amazon.it/albums/B0GPNBPBFT?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_Lc6EOAvQ1sOtY37rtgRHEjWKD",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_kHVLL2Y-Z--nzhzbgyOyWnbxGT1z5FlyA&si=SW9iOl0oEkJQGpkU",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/tu-x-tu",
    },
  },
  {
    kind: "Singolo",
    slug: "per-gli-altri",
    title: "per gli altri",
    releaseDate: d("2026-01-30"),
    presaveMode: false,
    artwork: nokoruMonoArtwork,
    alt: "Cover artwork di 'per gli altri'",
    ogImage: "/og-per-gli-altri.jpg",
    description: `"per gli altri" è il modo di vivere per chi sceglie di amare.\nMettere sempre le altre persone al primo posto, anche quando saremmo i primi ad aver bisogno di aiuto.\nUn inno all'amore per gli altri ed, allo stesso tempo, un promemoria.\nPerchè a volte, serve ricordarsi che l'amore che diamo agli altri lo meritiamo anche noi stessi.`,
    pressKitDescription: `Un brano intimo, che racconta l'amore per gli altri e, soprattutto, per noi stessi.`,
    year: 2026,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/5S0ApCxwF8aAGQlZCSTdLN?si=1611719cbb0c4efc",
      appleMusic:
        "https://music.apple.com/it/album/per-gli-altri/1863599627?i=1863599635",
      amazonMusic:
        "https://music.amazon.it/albums/B0GBYMP9CG?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_l3K8SL64pMAEKkkMeQvJo5uKS&trackAsin=B0GBZJWDGD",
      youtubeMusic:
        "https://music.youtube.com/watch?v=9uCztjupVeU&si=wVH0Cpz2anwOTAcx",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    },
  },
  {
    kind: "Singolo",
    slug: "davvero",
    title: "davvero",
    releaseDate: d("2026-01-30"),
    presaveMode: false,
    artwork: nokoruMonoArtwork,
    alt: "Cover artwork di 'davvero'",
    ogImage: "/og-davvero.jpg",
    description: `"davvero" è una promessa a me stesso.\nDopo un'intera vita passata ad essere il più severo dei giudici con me stesso, finalmente, realizzo che posso essere indulgente.\nPrometto che ci proverò.\nNon serve essere perfetto se non riesci ad essere te stesso, difetti compresi.`,
    pressKitDescription: `Un brano urban, che parla di accettazione di sè e crescita personale.`,
    year: 2026,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/5wU9L1yBhk6TZlv74ImyUB?si=fde0a6895f2040d7",
      appleMusic:
        "https://music.apple.com/it/album/davvero/1863599627?i=1863599634",
      amazonMusic:
        "https://music.amazon.it/albums/B0GBYMP9CG?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_PBIYZucHPBZNuSe9aOVnHWtoj&trackAsin=B0GBZGD2VJ",
      youtubeMusic:
        "https://music.youtube.com/watch?v=iQByJlOMuAA&si=-Mc2zSZ5TKG1H6eG",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    },
  },
  {
    kind: "Singolo",
    slug: "ricordo",
    title: "ricordo",
    releaseDate: d("2026-01-30"),
    presaveMode: false,
    artwork: nokoruMonoArtwork,
    alt: "Cover artwork di 'ricordo'",
    ogImage: "/og-ricordo.jpg",
    description: `"ricordo" è per mia nonna.\nUna raccolta di promesse, discorsi e frammenti di vita insieme.\nNon è una semplice dedica, ma una fotografia in musica di momenti passati che trovano l'eternità nella mia memoria.\nTe l'ho promesso, sai che le promesse le mantengo.\nNon ti preoccupare, ricordo.`,
    pressKitDescription: `Un brano intimo e personale, dedicato alla memoria di una persona cara, arricchito da registrazioni reali per rendere l'ascolto ancora più vero.`,
    year: 2026,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/14pzWWmgbj8czymiOLGnPu?si=b7851a1ac18a4494",
      appleMusic:
        "https://music.apple.com/it/album/ricordo/1863599627?i=1863599631",
      amazonMusic:
        "https://music.amazon.it/albums/B0GBYMP9CG?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_mqatuGbDUlhhYRJwPmOVIl5u6&trackAsin=B0GBZ891JQ",
      youtubeMusic:
        "https://music.youtube.com/watch?v=oK3RUE6RNzY&si=8w7PQ8LZGR4riX2H",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    },
  },
  {
    kind: "Singolo",
    slug: "rumore-di-fondo",
    title: "rumore di fondo",
    releaseDate: d("2025-11-14"),
    presaveMode: false,
    artwork: rumoreDiFondoArtwork,
    alt: "Cover artwork di 'rumore di fondo'",
    ogImage: "/og-rumore-di-fondo.jpg",
    description: `"rumore di fondo" è il suono che resta quando tutto il resto tace.\nÈ il pensiero che non smette mai di girare, la voce che continua a parlarti anche quando vorresti solo silenzio.\nRacconta una relazione che brucia ancora nelle vene, fatta di contrasti, di errori, di colpe condivise.\nÈ un viaggio nel caos interiore, tra nostalgia e consapevolezza, dove l'amore si confonde con il rumore e non sai più se ti tiene a galla o ti trascina giù.`,
    pressKitDescription: `Un brano R&B introspettivo che esplora il caos emotivo dopo una relazione irrisolta.`,
    year: 2025,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/track/3jAwmZHALqFWxy8pTMRmA6?si=s_2WH0IfTNO1E7UvEdbm7A&context=spotify%3Aalbum%3A1xO8LEQFfQSD0ZzJSQfDh8",
      appleMusic:
        "https://music.apple.com/it/album/rumore-di-fondo/1845625900?i=1845625902",
      amazonMusic:
        "https://music.amazon.it/albums/B0FVHGXX36?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_ccShKucCyNCMAq2QmVKbOSzpv&trackAsin=B0FVHGGTHV",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_nZZmAlqnr2KN7O2ad9rt5AJKZlRO4gnuM&si=OGAs8mTuwCJK_Xsa",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/rumore-di-fondo",
    },
  },
  {
    kind: "Singolo",
    slug: "cercami",
    title: "cercami",
    releaseDate: d("2025-10-03"),
    presaveMode: false,
    artwork: cercamiArtwork,
    alt: "Cover artwork di 'cercami'",
    ogImage: "/og-cercami.jpg",
    description: `"cercami" è un grido sommesso che nasce dal vuoto.\nÈ la paura di perdersi e il desiderio disperato di essere ritrovati da chi ci ha lasciati a metà.\nTra promesse infrante e passi incerti, la canzone attraversa la linea sottile tra l'attesa e la resa, tra l'amore che trattiene e quello che libera.\nÈ la corsa di chi non vuole più cercare invano, ma spera ancora che qualcuno, almeno una volta, lo cerchi davvero.`,
    pressKitDescription: `Un racconto emotivo tra attesa e smarrimento, con un sound sospeso tra pop e R&B.`,
    year: 2025,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/5PAjwZaJEGiw3JymgkxWRT?si=7e0972d6ee6e4aee",
      appleMusic:
        "https://music.apple.com/it/album/cercami/1836640192?i=1836640193",
      amazonMusic:
        "https://music.amazon.it/albums/B0FP5MT7YQ?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_w5ycqYJFt17vUi56NUzYt2nrQ",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_mthw_Ju4zls-ciyernNqe_BfZQVJq_3P8&si=S_HCtI1BJ1OCN51e",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/cercami",
    },
  },
  {
    kind: "Singolo",
    slug: "tra-le-nuvole-sunset-version",
    title: "tra le nuvole - sunset version",
    releaseDate: d("2025-08-07"),
    presaveMode: false,
    artwork: traLeNuvoleSVArtwork,
    alt: "Cover artwork di 'tra le nuvole - sunset version'",
    ogImage: "/og-tra-le-nuvole-sunset-version.jpg",
    description: `"tra le nuvole – sunset version" è un respiro lento al calare del sole.\nSpogliata di tutto, resta solo una voce e una chitarra a raccontare la distanza tra ciò che è stato e ciò che manca.\nOgni corda vibra come un pensiero che non si spegne, ogni parola è un ricordo che torna a bussare piano.\nÈ la malinconia che si illumina d'arancio, quando anche il silenzio sa di te.`,
    pressKitDescription: `Versione acustica e minimale che restituisce il brano alla sua forma più intima.`,
    year: 2025,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/45CEyfLKXPZON36PyevLDA?si=e378c4663b90499d",
      appleMusic:
        "https://music.apple.com/it/album/tra-le-nuvole-sunset-version/1829063940?i=1829063941",
      amazonMusic:
        "https://music.amazon.it/albums/B0FJYDPZF6?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_J2wNEhWONMl58KejvEB6mR5Xv",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_m3Bj87TcveNpcW-mUK90E6u0_BByfwrm8&si=69Ir_H6W6Q1UwHau",
      hyperfollow:
        "https://distrokid.com/hyperfollow/lacco/tra-le-nuvole-sunset-version",
    },
  },
  {
    kind: "Singolo",
    slug: "tra-le-nuvole",
    title: "tra le nuvole",
    releaseDate: d("2025-06-27"),
    presaveMode: false,
    artwork: traLeNuvoleArtwork,
    alt: "Cover artwork di 'tra le nuvole'",
    ogImage: "/og-tra-le-nuvole.jpg",
    description: `"tra le nuvole" è un sogno che non vuole finire, anche quando fa male restarci dentro.\nParla di chi vive a metà tra il ricordo e il presente, di chi cerca un volto perduto tra le pieghe del sonno.\nOgni risveglio è una piccola caduta, ogni pensiero un'altalena tra cielo e terra.\nÈ la canzone di chi continua a volare, anche con la testa pesante di nostalgia.`,
    pressKitDescription: `Un viaggio sognante tra nostalgia e desiderio, sospeso tra sonorità pop e atmosfere eteree.`,
    year: 2025,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/2dJJQune4W5JR5tOxQCIr6?si=ee0c536bf39f4952",
      appleMusic:
        "https://music.apple.com/it/album/tra-le-nuvole/1815213555?i=1815213556",
      amazonMusic:
        "https://music.amazon.it/albums/B0F92W8RKZ?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_LqjaUzcle6krZJ8TMI7eKB9bo",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_mOpz-g6ekcIR2SczAx2MCwBqw8O2E1vJw&si=1KiXtCCstUqV3X5n",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/tra-le-nuvole",
    },
  },
  {
    kind: "Singolo",
    slug: "mondo-dentro",
    title: "mondo dentro",
    releaseDate: d("2024-12-13"),
    presaveMode: false,
    artwork: mondoDentroArtwork,
    alt: "Cover artwork di 'mondo dentro'",
    ogImage: "/og-mondo-dentro.jpg",
    description: `"mondo dentro" è l'amore che resta, anche quando tutto il resto finisce.\nÈ guardarla andare via e sorridere lo stesso, perché la vedi finalmente serena.\nParla di accettare che a volte amare significa lasciar andare, senza rancore, senza catene.\nÈ una carezza che arriva da lontano, perché, in fondo, quel mondo dentro di lei è anche il posto in cui una parte di te vivrà per sempre.`,
    pressKitDescription: `Una ballad emotiva che parla di accettazione, distacco e amore che continua a esistere nel silenzio.`,
    year: 2024,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/4UgUDDPg1QVNP6XI9x4eWL?si=fd8cef6bab354b46",
      appleMusic:
        "https://music.apple.com/it/album/mondo-dentro/1778959317?i=1778959318",
      amazonMusic:
        "https://music.amazon.it/albums/B0DMKL7DNV?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_uPZ2RhQPyR9q61FMQGdEUk7Ox",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_kd3jLSwU6IJntPIQJEnXYOKcYZCWOlfnw&si=HZHvRXTi_H4nFalI",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/mondo-dentro",
    },
  },
  {
    kind: "Singolo",
    slug: "tempo-perso",
    title: "tempo perso",
    releaseDate: d("2024-10-11"),
    presaveMode: false,
    artwork: tempoPersoArtwork,
    alt: "Cover artwork di 'tempo perso'",
    ogImage: "/og-tempo-perso.jpg",
    description: `"tempo perso" è il dialogo con sé stessi quando tutto sembra inutile.\nÈ la voce di chi si sente fuori tempo, fuori posto, ma continua a cercare un senso dentro ciò che ama davvero.\nParla della fatica di vivere secondo regole che non ci appartengono, e della musica come unico spazio in cui respirare.\nAnche quando tutto e tutti ti fanno sembrare che lo sia, ricorda, non è mai tempo perso.`,
    pressKitDescription: `Una riflessione sincera sulla ricerca di sé, tra vulnerabilità e resistenza personale.`,
    year: 2024,
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/track/4NJvJAcd0hn8Azs0yJZH3b?si=cc24527676e1438a",
      appleMusic:
        "https://music.apple.com/it/album/tempo-perso/1773232687?i=1773232688",
      amazonMusic:
        "https://music.amazon.it/albums/B0DJRJDMLJ?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_o8RDMr9aF0yVsQUF09HEmEmO6",
      youtubeMusic:
        "https://music.youtube.com/watch?v=nhz1m99VDpQ&si=SAO2E7Oc1GOhNk7h",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/tempo-perso",
    },
  },
  {
    kind: "EP",
    slug: "nokoru-mono",
    title: "nokoru mono",
    releaseDate: d("2026-01-30"),
    presaveMode: false,
    artwork: nokoruMonoArtwork,
    alt: "Cover artwork dell'EP 'nokoru mono'",
    ogImage: "/og-nokoru-mono.jpg",
    description: `nokoru mono — "quelli che restano".\nUn EP stratificato, intimo e profondamente personale. Racconta il mondo interiore, le emozioni che accompagnano la crescita e gli spazi che si muovono dentro di noi, anche quando tutto sembra fermo. Il suono è R&B: caldo, meditativo, riflessivo.\nL'artwork, ispirato all'omonima opera di Boccioni dal trittico "Stati d'animo", è il primo pezzo di un puzzle più grande.`,
    pressKitDescription: `Un EP R&B intimo e stratificato sul mondo interiore, la crescita e ciò che resta.`,
    year: 2026,
    credits: [
      {
        label: "Artwork di Nicolò Piazza (Torino Ink)",
        url: "https://www.instagram.com/torino_ink",
      },
    ],
    streamingLinks: {
      spotify:
        "https://open.spotify.com/intl-it/album/03t1vGNiDM9ORxsVWSnp8E?si=G7J5EBWJTNm3QMXpQytV1Q",
      appleMusic: "https://music.apple.com/it/album/nokoru-mono/1863599627",
      amazonMusic:
        "https://music.amazon.it/albums/B0GBYMP9CG?marketplaceId=APJ6JRA9NG5V4&musicTerritory=IT&ref=dm_sh_2FF2BkMxVEFhZGYB85uQrupvc",
      youtubeMusic:
        "https://music.youtube.com/playlist?list=OLAK5uy_nKuNsOLYktJBLXepttZFs5JsSOGkOlWHA&si=I3Mb_6fssGowyKE2",
      hyperfollow: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    },
    trackSlugs: [
      "tempo-perso",
      "cercami",
      "tra-le-nuvole",
      "ricordo",
      "mondo-dentro",
      "rumore-di-fondo",
      "davvero",
      "per-gli-altri",
    ],
  },
];

// ===================== TYPE GUARDS & LISTE DERIVATE ===================== //
export function isAlbum(release: Release): release is Album {
  return release.kind !== "Singolo";
}

export function isSingle(release: Release): release is Single {
  return release.kind === "Singolo";
}

export const singles: Single[] = catalog.filter(isSingle);
export const albums: Album[] = catalog.filter(isAlbum);

// ===================== LOOKUP HELPERS ===================== //
export function getReleaseBySlug(slug: string): Release | undefined {
  return catalog.find((r) => r.slug === slug);
}

export function getSongBySlug(slug: string): Single | undefined {
  return singles.find((s) => s.slug === slug);
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return albums.find((a) => a.slug === slug);
}

// Tracce dell'album nell'ordine di trackSlugs (scarta gli slug non trovati).
export function getAlbumTracks(album: Album): Single[] {
  return album.trackSlugs
    .map((slug) => getSongBySlug(slug))
    .filter((song): song is Single => song !== undefined);
}

// Derivazione inversa: a quale album appartiene un dato singolo (se esiste).
export function getAlbumForSong(songSlug: string): Album | undefined {
  return albums.find((a) => a.trackSlugs.includes(songSlug));
}

// Tutela in dev: ogni trackSlug deve corrispondere a un singolo del catalogo.
if (import.meta.env.DEV) {
  const knownSongSlugs = new Set(singles.map((s) => s.slug));

  for (const album of albums) {
    for (const slug of album.trackSlugs) {
      if (!knownSongSlugs.has(slug)) {
        console.warn(
          `[catalog] trackSlug "${slug}" dell'album "${album.slug}" non esiste tra i singoli.`,
        );
      }
    }
  }
}
