// ========================== IMPORT DIPENDENZE PRINCIPALI ========================== //
// Importa funzioni di stile, layout e componenti personalizzati per la pagina “La mia musica”.

import { subtitle, title } from "@/components/primitives"; // Classi di stile per i titoli principali e secondari
import DefaultLayout from "@/layouts/default"; // Layout base (include navbar e footer)
import CardSongExposer from "@/components/cardSongExposer"; // Componente personalizzato per mostrare ogni singolo musicale
import { songList } from "@/config/songList"; // Dati statici dei brani (titolo, descrizione, artwork, link, ecc.)
import { Helmet } from "react-helmet-async"; // <--- Import di Helmet per SEO e meta tag
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"; // <--- Icone per lo scroll
import { useRef, useState, useEffect } from "react"; // <--- Hook per riferimento al contenitore scrollabile
import { Button } from "@heroui/react";

// ========================== COMPONENTE PRINCIPALE ========================== //
// Pagina “La mia musica” – visualizza tutti i singoli con descrizione e copertina.

export default function MusicPage() {
  // Riferimento al contenitore scrollabile
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Stati per gestire visibilità (opacity) delle frecce
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // ========================== FUNZIONI DI SCORRIMENTO ========================== //
  // Scorre il contenitore di una card alla volta, a destra o sinistra
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const card = container.querySelector(".card-song");
    if (!card) return;

    const cardWidth = (card as HTMLElement).offsetWidth + 16; // 16px ≈ somma margini laterali (px-2)
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // ========================== GESTIONE EVENTO SCROLL ========================== //
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const card = container.querySelector(".card-song") as HTMLElement;
    if (!card) return;

    const cardWidth = card.offsetWidth;
    container.style.scrollPadding = `0px calc(50% - ${cardWidth / 2}px)`;

    // ==========================
    // SCROLL INIZIALE PER CENTRARE LA PRIMA CARD
    // ==========================
    // La prima card parte centrata rispetto al viewport
    container.scrollTo({ left: 0, behavior: "auto" });

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      setIsAtStart(scrollLeft <= (2*cardWidth));
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - (2*cardWidth));
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ========================== RENDER ========================== //
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
          <div className="flex flex-row items-center gap-4 max-w-full">
            {/* Freccia sinistra */}
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => scroll("left")}
              className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110 ${
                isAtStart ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              aria-label="Scorri a sinistra"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </Button>

            {/* ========================== CAROSELLO CANZONI ========================== */}
            <div
              ref={scrollContainerRef}
              className="flex py-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing max-w-full"
            >
              <div className="pl-200"/> {/*carousel off-set*/}
              {songList.map((song) => (
                <div
                  key={song.title}
                  className="card-song shrink-0 snap-center px-4 max-w-full transition-transform hover:scale-105 active:scale-95"
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
              <div className="pr-200"/> {/*carousel off-set*/}
            </div>

            {/* Freccia destra */}
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              onPress={() => scroll("right")}
              className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110 ${
                isAtEnd ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              aria-label="Scorri a destra"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </Button>
          </div>
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
