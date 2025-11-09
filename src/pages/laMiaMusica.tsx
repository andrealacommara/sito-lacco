// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa funzioni di stile, layout e componenti personalizzati per la pagina “La mia musica”.

import { subtitle, title } from "@/components/primitives"; // Classi di stile per i titoli principali e secondari
import DefaultLayout from "@/layouts/default"; // Layout base (include navbar e footer)
import CardSongExposer from "@/components/cardSongExposer"; // Componente personalizzato per mostrare ogni singolo musicale
import { songList } from "@/config/songList"; // Dati statici dei brani (titolo, descrizione, artwork, link, ecc.)
import { Helmet } from "react-helmet-async"; // <--- Import di Helmet per SEO e meta tag
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"; // <--- Icone per lo scroll
import { useRef } from "react"; // <--- Hook per riferimento al contenitore scrollabile
import { Button } from "@heroui/react";

// ========================== COMPONENTE PRINCIPALE ========================== //
// Pagina “La mia musica” – visualizza tutti i singoli con descrizione e copertina.

export default function MusicPage() {
  // Riferimento al contenitore scrollabile
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ========================== FUNZIONI DI SCORRIMENTO ========================== //
  // Scorre il contenitore di una card alla volta, a destra o sinistra
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Trova la prima card per calcolare larghezza + margini
    const card = container.querySelector("div > div");
    if (!card) return;

    const cardWidth = (card as HTMLElement).offsetWidth + 16; // 16px ≈ somma margini laterali (px-2)
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Titolo e description dinamici per SEO Google */}
      <Helmet>
        <title>Lacco | La mia musica</title>
        <meta
          name="description"
          content="Scopri la musica di Lacco: la storia di ogni brano, l‘artwork e il link per ascoltarlo su Spotify."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* ========================== SEZIONE TITOLO ========================== */}
      {/* Titolo principale della pagina */}
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>

      {/* ========================== SEZIONE CONTENUTI ========================== */}
      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        {/* Sottotitolo introduttivo */}
        <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>

        {/* ========================== WRAPPER COMPLETO CAROSELLO + FRECCE ========================== */}
        {/* Le frecce restano ai lati del carosello, senza sovrapporsi alle card */}
        <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
          {/* Freccia sinistra */}
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => scroll("left")}
            className="hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </Button>

          {/* ========================== CAROSELLO CANZONI ========================== */}
          <div
            ref={scrollContainerRef}
            className="flex p-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing w-full max-w-[90vw]"
          >
            {songList.map((song) => (
              <div
                key={song.title}
                className="shrink-0 snap-center px-2 max-w-full first:ml-[calc(50vw-140px)] last:mr-[calc(50vw-140px)] transition-transform hover:scale-105 active:scale-95"
              >
                <CardSongExposer
                  artworkAlt={song.alt}
                  artworkSrc={song.src}
                  preSaveMode={song.preSaveMode}
                  songDescription={song.description}
                  songSpotifyLink={song.spotifyLink}
                  songTitle={song.title}
                />
              </div>
            ))}
          </div>

          {/* Freccia destra */}
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => scroll("right")}
            className="hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110"
            aria-label="Scorri a destra"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* ========================== SEZIONE CONCLUSIVA ========================== */}
        {/* Breve messaggio finale all’utente */}
        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-small">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
