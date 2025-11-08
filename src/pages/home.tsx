// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa il layout, componenti UI e asset necessari per costruire la homepage.

import { Image } from "@heroui/image"; // Componente ottimizzato per immagini (con supporto blur e loading)
import { Card, Skeleton } from "@heroui/react"; // Componenti UI per contenitori e placeholder
import { useState } from "react"; // Hook React per la gestione dello stato locale

import DefaultLayout from "@/layouts/default"; // Layout generale del sito (navbar + footer)
import SpotifyPlayer from "@/components/spotifyPlayer"; // Componente personalizzato per il player Spotify
import { subtitle, title } from "@/components/primitives"; // Stili tipografici per titoli e sottotitoli
import totalPurpleLacco from "/images/totalPurpleLacco.avif"; // Immagine principale dell’artista

// ========================== COMPONENTE HOMEPAGE ========================== //
// Mostra una breve introduzione all’artista e incorpora un player Spotify.

export default function IndexPage() {
  // Stato che controlla se l’immagine è stata caricata.
  // Serve per mostrare un effetto “skeleton” finché l’immagine non è pronta.
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <DefaultLayout>
      {/* ========================== SEZIONE INTRODUTTIVA ========================== */}
      <section className="flex flex-row text-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Scopri di più su Lacco</h1>
      </section>

      {/* ========================== CARD PRINCIPALE ========================== */}
      {/* Contiene l’immagine e la descrizione dell’artista */}
      <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 gap-2 md:gap-4 mx-auto  w-full max-w-5xl">
        {/* Placeholder visivo finché l’immagine non è caricata */}
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-lg">
            <div className="h-full w-full bg-default-300 rounded-lg" />
          </Skeleton>
        )}

        {/* ========================== IMMAGINE DELL’ARTISTA ========================== */}
        <div className="p-4 md:p-4 w-fit md:w-full items-center">
          <Image
            isBlurred // Applica un effetto di sfocatura leggera
            alt="Total Purple Lacco" // Testo alternativo per accessibilità
            className="item-center"
            src={totalPurpleLacco} // Immagine importata
            width={400}
            loading="eager"
            onLoad={() => setIsLoaded(true)} // Quando il caricamento è completo, rimuove lo skeleton
          />
        </div>

        {/* ========================== DESCRIZIONE ARTISTA ========================== */}
        <div className="p-2 md:p-4">
          <h1 className={subtitle()}>
            Lacco unisce R&B e sonorità hip-hop in un viaggio introspettivo alla
            scoperta di sé.
            <br />
            L‘obiettivo è quello di raccontare in musica ciò che è solito
            rimanere nascosto, in assordante silezio, dentro ognuno di noi.
          </h1>
        </div>
      </Card>

      {/* ========================== SEZIONE PLAYER SPOTIFY ========================== */}
      <div className="flex flex-row items-center justify-center py-4 md:py-4">
        <h2 className={subtitle()}>Ascolta subito i suoi brani</h2>
      </div>

      {/* Player Spotify incorporato tramite componente dedicato */}
      <SpotifyPlayer
        size="large"
        srcPlayer="https://open.spotify.com/embed/playlist/2OmODLkWLB3F6sPHYQe07g?utm_source=generator"
      />
    </DefaultLayout>
  );
}
