// ========================== MAIN IMPORTS ========================== //
// Import cover artwork images for each song from the assets folder.
// These images visually populate the music section of the site.

import cercamiArtwork from "@/assets/images/artworks/cercamiArtwork.avif";
import mondoDentroArtwork from "@/assets/images/artworks/mondoDentroArtwork.avif";
import rumoreDiFondoArtwork from "@/assets/images/artworks/rumoreDiFondoArtwork.avif";
import tempoPersoArtwork from "@/assets/images/artworks/tempoPersoArtwork.avif";
import traLeNuvoleArtwork from "@/assets/images/artworks/traLeNuvoleArtwork.avif";
import traLeNuvoleSVArtwork from "@/assets/images/artworks/traLeNuvoleSunsetVersionArtwork.avif";

// ========================== TYPE DEFINITION ========================== //
// Export a TypeScript type based on the `songList` array structure.
// Ensures type safety and autocompletion across the application.
export type songList = typeof songList;

// ========================== SONG LIST ========================== //
// Array of published songs, each object containing title, artwork, description, Spotify link (or pre-save link) and pre-save flag.

export const songList = [
  {
    title: "rumore di fondo",
    src: rumoreDiFondoArtwork,
    alt: "Cover artwork di 'rumore di fondo'",
    description:
      "“rumore di fondo” è il suono che resta quando tutto il resto tace.\nÈ il pensiero che non smette mai di girare, la voce che continua a parlarti anche quando vorresti solo silenzio.\nRacconta una relazione che brucia ancora nelle vene, fatta di contrasti, di errori, di colpe condivise.\nÈ un viaggio nel caos interiore, tra nostalgia e consapevolezza, dove l’amore si confonde con il rumore e non sai più se ti tiene a galla o ti trascina giù.",
    spotifyLink: "https://www.lacco.it/rumore-di-fondo",
    preSaveMode: true,
  },
  {
    title: "cercami",
    src: cercamiArtwork,
    alt: "Cover artwork di 'cercami'",
    description:
      "“cercami” è un grido sommesso che nasce dal vuoto.\nÈ la paura di perdersi e il desiderio disperato di essere ritrovati da chi ci ha lasciati a metà.\nTra promesse infrante e passi incerti, la canzone attraversa la linea sottile tra l’attesa e la resa, tra l’amore che trattiene e quello che libera.\nÈ la corsa di chi non vuole più cercare invano, ma spera ancora che qualcuno, almeno una volta, lo cerchi davvero.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/5PAjwZaJEGiw3JymgkxWRT?si=7e0972d6ee6e4aee",
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
    preSaveMode: false,
  },
];
