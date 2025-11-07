import cercamiArtwork from "@/assets/images/artworks/cercamiArtwork.jpg";
import mondoDentroArtwork from "@/assets/images/artworks/mondoDentroArtwork.jpg";
import rumoreDiFondoArtwork from "@/assets/images/artworks/rumoreDiFondoArtwork.jpg";
import tempoPersoArtwork from "@/assets/images/artworks/tempoPersoArtwork.jpg";
import traLeNuvoleArtwork from "@/assets/images/artworks/traLeNuvoleArtwork.jpg";
import traLeNuvoleSVArtwork from "@/assets/images/artworks/traLeNuvoleSunsetVersionArtwork.jpg";

export type songList = typeof songList;

export const songList = [
  {
    title: "rumore di fondo",
    src: rumoreDiFondoArtwork,
    alt: "Cover artwork di 'rumore di fondo'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink: "https://www.lacco.it/rumore-di-fondo",
    preSaveMode: true,
  },
  {
    title: "cercami",
    src: cercamiArtwork,
    alt: "Cover artwork di 'cercami'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/5PAjwZaJEGiw3JymgkxWRT?si=7e0972d6ee6e4aee",
    preSaveMode: false,
  },
  {
    title: "tra le nuvole - sunset version",
    src: traLeNuvoleSVArtwork,
    alt: "Cover artwork di 'tra le nuvole - sunset version'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/45CEyfLKXPZON36PyevLDA?si=e378c4663b90499d",
    preSaveMode: false,
  },
  {
    title: "tra le nuvole",
    src: traLeNuvoleArtwork,
    alt: "Cover artwork di 'tra le nuvole'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/2dJJQune4W5JR5tOxQCIr6?si=ee0c536bf39f4952",
    preSaveMode: false,
  },
  {
    title: "mondo dentro",
    src: mondoDentroArtwork,
    alt: "Cover artwork di 'mondo dentro'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/4UgUDDPg1QVNP6XI9x4eWL?si=fd8cef6bab354b46",
    preSaveMode: false,
  },
  {
    title: "tempo perso",
    src: tempoPersoArtwork,
    alt: "Cover artwork di 'tempo perso'",
    description: "Qui va inserita la descrizione del brano.",
    spotifyLink:
      "https://open.spotify.com/intl-it/track/4NJvJAcd0hn8Azs0yJZH3b?si=cc24527676e1438a",
    preSaveMode: false,
  },
];
