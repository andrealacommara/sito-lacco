// ========================== MAIN IMPORTS ========================== //
// Import style functions, layout, and custom components for the “La mia musica” page.

import { Helmet } from "react-helmet-async"; // Helmet for SEO and meta tags
import { useRef, useState, useEffect } from "react"; // Hooks for scroll container reference and state
import { Button } from "@heroui/button";

import { subtitle, title } from "@/components/primitives"; // Style classes for main and secondary titles
import DefaultLayout from "@/layouts/default"; // Base layout (includes navbar and footer)
import CardSongExposer from "@/components/cardSongExposer"; // Custom component to display each song
import { songList } from "@/config/songList"; // Static song data (title, description, artwork, link, etc.)
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"; // Icons for carousel scroll

// ========================== MUSIC PAGE COMPONENT ========================== //
// “La mia musica” page – displays all singles with descriptions and cover art.

export default function MusicPage() {
  // Reference to the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // States to handle arrow visibility (opacity)
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // ========================== SCROLL FUNCTIONS ========================== //
  // Scrolls one card at a time, left or right
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const card = container.querySelector(".card-song");

    if (!card) return;

    const cardWidth = (card as HTMLElement).offsetWidth + 16; // 16px ≈ total horizontal margin (px-2)
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // ========================== SCROLL EVENT HANDLER ========================== //
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const card = container.querySelector(".card-song") as HTMLElement;

    if (!card) return;

    const cardWidth = card.offsetWidth;

    container.style.scrollPadding = `0px calc(50% - ${cardWidth / 2}px)`;

    // ========================== INITIAL SCROLL CENTERING ========================== //
    // The first card starts centered within the viewport
    container.scrollTo({ left: 0, behavior: "auto" });

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      setIsAtStart(scrollLeft <= 2 * cardWidth);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 2 * cardWidth);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ========================== RENDER ========================== //
  return (
    <DefaultLayout>
      {/* ========================== HELMET ========================== */}
      {/* Dynamic title and description for Google SEO */}
      <Helmet>
        <title>Lacco | La mia musica</title>
        <meta
          content="Scopri la musica di Lacco: la storia di ogni brano, l‘artwork e il link per ascoltarlo su Spotify."
          name="description"
        />
        <meta content="index, follow" name="robots" />
      </Helmet>

      {/* ========================== TITLE SECTION ========================== */}
      {/* Main page title */}
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>

      {/* ========================== CONTENT SECTION ========================== */}
      <div className="flex flex-col justify-center min-h-fit md:min-h-fit">
        {/* Intro subtitle */}
        <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>

        {/* ========================== FULL WRAPPER: CAROUSEL + ARROWS ========================== */}
        {/* The arrows remain beside the carousel without overlapping cards */}
        <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
          <div className="flex flex-row items-center gap-4 max-w-full max-h-fit">
            {/* Left arrow */}
            <Button
              isIconOnly
              aria-label="Scorri a sinistra"
              className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110 ${
                isAtStart ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              radius="full"
              variant="flat"
              onPress={() => scroll("left")}
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </Button>

            {/* ========================== SONG CAROUSEL ========================== */}
            <div
              ref={scrollContainerRef}
              className="flex py-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing max-w-full px-6 sm:px-12 md:px-0"
            >
              <div className="pl-200" /> {/* carousel offset */}
              {songList.map((song) => (
                <div
                  key={song.title}
                  className="card-song shrink-0 snap-center px-2 max-w-full transition-transform hover:scale-105 active:scale-95"
                >
                  <CardSongExposer
                    artworkAlt={song.alt}
                    artworkSrc={song.src}
                    preSaveMode={song.preSaveMode}
                    songDescription={song.description}
                    songSpotifyLink={song.spotifyLink}
                    songTitle={song.title}
                    songAppleMusicLink={song.appleMusicLink}
                  />
                </div>
              ))}
              <div className="pr-200" /> {/* carousel offset */}
            </div>

            {/* Right arrow */}
            <Button
              isIconOnly
              aria-label="Scorri a destra"
              className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition hover:scale-110 ${
                isAtEnd ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              radius="full"
              variant="flat"
              onPress={() => scroll("right")}
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* ========================== CLOSING SECTION ========================== */}
        {/* Short closing message for the user */}
        <div className="flex justify-center">
          <h3 className="w-full md:w-1/2 my-2 text-default-400 block max-w-full text-center font-light text-small">
            Ogni brano è una parte di me, buon ascolto.
          </h3>
        </div>
      </div>
    </DefaultLayout>
  );
}
