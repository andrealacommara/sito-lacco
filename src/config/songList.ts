// ========================== MAIN IMPORTS ========================== //
// Import cover artwork images for each song from the assets folder.
// These images visually populate the music section of the site.

import cercamiArtwork from "@/assets/images/artworks/cercamiArtwork.avif";
import mondoDentroArtwork from "@/assets/images/artworks/mondoDentroArtwork.avif";
import rumoreDiFondoArtwork from "@/assets/images/artworks/rumoreDiFondoArtwork.avif";
import tempoPersoArtwork from "@/assets/images/artworks/tempoPersoArtwork.avif";
import traLeNuvoleArtwork from "@/assets/images/artworks/traLeNuvoleArtwork.avif";
import traLeNuvoleSVArtwork from "@/assets/images/artworks/traLeNuvoleSunsetVersionArtwork.avif";
import ricordoArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";
import davveroArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";
import perGliAltriArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif";

// ========================== TYPE DEFINITION ========================== //
// Export a TypeScript type based on the `songList` array structure.
// Ensures type safety and autocompletion across the application.
export type songList = typeof songList;

// ========================== SONG LIST ========================== //
// Array of published songs, each object containing title, artwork, description, Spotify link (or pre-save link) and pre-save flag.

export const songList = [
  {
    title: "per gli altri",
    src: perGliAltriArtwork,
    alt: "Cover artwork di 'per gli altri'",
    description:
      "“per gli altri” è il modo di vivere per chi sceglie di amare.\nMettere sempre le altre persone al primo posto, anche quando saremmo i primi ad aver bisogno di aiuto.\nUn inno all'amore per gli altri ed, allo stesso tempo, un promemoria.\nPerchè, a volte, serve ricordarsi che l'amore che diamo agli altri lo meritiamo anche noi stessi.",
    spotifyLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    appleMusicLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    year: 2026,
    pressKitDescription:
      "Un brano intimo, che racconta l'amore per gli altri e, soprattutto, per noi stessi.",
    preSaveMode: true,
  },
  {
    title: "davvero",
    src: davveroArtwork,
    alt: "Cover artwork di 'davvero'",
    description:
      "“davvero” è una promessa a me stesso.\nDopo un'intera vita passata ad essere il più severo dei giudici con me stesso, finalmente, realizzo che posso essere indulgente.\nPrometto che ci proverò.\nNon serve essere perfetto se non riesci ad essere te stesso, difetti compresi.",
    spotifyLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    appleMusicLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    year: 2026,
    pressKitDescription:
      "Un brano urban, che parla di accettazione di sè e crescita personale",
    preSaveMode: true,
  },
  {
    title: "ricordo",
    src: ricordoArtwork,
    alt: "Cover artwork di 'ricordo'",
    description:
      "“ricordo” è per mia nonna.\nUna raccolta di promesse, discorsi e frammenti di vita insieme.\nNon è una semplice dedica, ma una fotografia in musica di momenti passati che trovano l'eternità nella mia memoria.\nTe l'ho promesso, sai che le promesse le mantengo.\nNon ti preoccupare, ricordo.",
    spotifyLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    appleMusicLink: "https://distrokid.com/hyperfollow/lacco/nokoru-mono",
    year: 2026,
    pressKitDescription:
      "Un brano intimo e personale, dedicato alla memoria di una persona cara, arricchito da registrazioni reali per rendere l'ascolto ancora più vero.",
    preSaveMode: true,
  },
  {
    title: "rumore di fondo",
    src: rumoreDiFondoArtwork,
    alt: "Cover artwork di 'rumore di fondo'",
    description:
      "“rumore di fondo” è il suono che resta quando tutto il resto tace.\nÈ il pensiero che non smette mai di girare, la voce che continua a parlarti anche quando vorresti solo silenzio.\nRacconta una relazione che brucia ancora nelle vene, fatta di contrasti, di errori, di colpe condivise.\nÈ un viaggio nel caos interiore, tra nostalgia e consapevolezza, dove l’amore si confonde con il rumore e non sai più se ti tiene a galla o ti trascina giù.",
    spotifyLink:
      "https://open.spotify.com/track/3jAwmZHALqFWxy8pTMRmA6?si=s_2WH0IfTNO1E7UvEdbm7A&context=spotify%3Aalbum%3A1xO8LEQFfQSD0ZzJSQfDh8",
    appleMusicLink:
      "https://music.apple.com/it/album/rumore-di-fondo/1845625900?i=1845625902",
    year: 2025,
    pressKitDescription:
      "Un brano R&B introspettivo che esplora il caos emotivo dopo una relazione irrisolta.",
    preSaveMode: false,
  },
  {
    title: "cercami",
    src: cercamiArtwork,
    alt: "Cover artwork di 'cercami'",
    description:
      "“cercami” è un grido sommesso che nasce dal vuoto.\nÈ la paura di perdersi e il desiderio disperato di essere ritrovati da chi ci ha lasciati a metà.\nTra promesse infrante e passi incerti, la canzone attraversa la linea sottile tra l’attesa e la resa, tra l’amore che trattiene e quello che libera.\nÈ la corsa di chi non vuole più cercare invano, ma spera ancora che qualcuno, almeno una volta, lo cerchi davvero.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/5PAjwZaJEGiw3JymgkxWRT?si=7e0972d6ee6e4aee",
    appleMusicLink:
      "https://music.apple.com/it/album/cercami/1836640192?i=1836640193",
    year: 2025,
    pressKitDescription:
      "Un racconto emotivo tra attesa e smarrimento, con un sound sospeso tra pop e R&B.",
    preSaveMode: false,
  },
  {
    title: "tra le nuvole - sunset version",
    src: traLeNuvoleSVArtwork,
    alt: "Cover artwork di 'tra le nuvole - sunset version'",
    description:
      "“tra le nuvole – sunset version” è un respiro lento al calare del sole.\nSpogliata di tutto, resta solo una voce e una chitarra a raccontare la distanza tra ciò che è stato e ciò che manca.\nOgni corda vibra come un pensiero che non si spegne, ogni parola è un ricordo che torna a bussare piano.\nÈ la malinconia che si illumina d’arancio, quando anche il silenzio sa di te.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/45CEyfLKXPZON36PyevLDA?si=e378c4663b90499d",
    appleMusicLink:
      "https://music.apple.com/it/album/tra-le-nuvole-sunset-version/1829063940?i=1829063941",
    year: 2025,
    pressKitDescription:
      "Versione acustica e minimale che restituisce il brano alla sua forma più intima.",
    preSaveMode: false,
  },
  {
    title: "tra le nuvole",
    src: traLeNuvoleArtwork,
    alt: "Cover artwork di 'tra le nuvole'",
    description:
      "“tra le nuvole” è un sogno che non vuole finire, anche quando fa male restarci dentro.\nParla di chi vive a metà tra il ricordo e il presente, di chi cerca un volto perduto tra le pieghe del sonno.\nOgni risveglio è una piccola caduta, ogni pensiero un’altalena tra cielo e terra.\nÈ la canzone di chi continua a volare, anche con la testa pesante di nostalgia.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/2dJJQune4W5JR5tOxQCIr6?si=ee0c536bf39f4952",
    appleMusicLink:
      "https://music.apple.com/it/album/tra-le-nuvole/1815213555?i=1815213556",
    year: 2025,
    pressKitDescription:
      "Un viaggio sognante tra nostalgia e desiderio, sospeso tra sonorità pop e atmosfere eteree.",
    preSaveMode: false,
  },
  {
    title: "mondo dentro",
    src: mondoDentroArtwork,
    alt: "Cover artwork di 'mondo dentro'",
    description:
      "“mondo dentro” è l’amore che resta, anche quando tutto il resto finisce.\nÈ guardarla andare via e sorridere lo stesso, perché la vedi finalmente serena.\nParla di accettare che a volte amare significa lasciar andare, senza rancore, senza catene.\nÈ una carezza che arriva da lontano, perché, in fondo, quel mondo dentro di lei è anche il posto in cui una parte di te vivrà per sempre.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/4UgUDDPg1QVNP6XI9x4eWL?si=fd8cef6bab354b46",
    appleMusicLink:
      "https://music.apple.com/it/album/mondo-dentro/1778959317?i=1778959318",
    year: 2024,
    pressKitDescription:
      "Una ballad emotiva che parla di accettazione, distacco e amore che continua a esistere nel silenzio.",
    preSaveMode: false,
  },
  {
    title: "tempo perso",
    src: tempoPersoArtwork,
    alt: "Cover artwork di 'tempo perso'",
    description:
      "“tempo perso” è il dialogo con sé stessi quando tutto sembra inutile.\nÈ la voce di chi si sente fuori tempo, fuori posto, ma continua a cercare un senso dentro ciò che ama davvero.\nParla della fatica di vivere secondo regole che non ci appartengono, e della musica come unico spazio in cui respirare.\nAnche quando tutto e tutti ti fanno sembrare che lo sia, ricorda, non è mai tempo perso.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/4NJvJAcd0hn8Azs0yJZH3b?si=cc24527676e1438a",
    appleMusicLink:
      "https://music.apple.com/it/album/tempo-perso/1773232687?i=1773232688",
    year: 2024,
    pressKitDescription:
      "Una riflessione sincera sulla ricerca di sé, tra vulnerabilità e resistenza personale.",
    preSaveMode: false,
  },
];
