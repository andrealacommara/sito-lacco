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
import { Card } from "@heroui/card"; // UI component for container
import SmartImage from "@/components/smartImage";
import { Skeleton } from "@heroui/skeleton"; // Loading placeholder
import nokoruMonoArtwork from "@/assets/images/artworks/nokoruMonoArtwork.avif"; // Main artist image
import { Link } from "@heroui/link";

// ========================== MUSIC PAGE COMPONENT ========================== //
// “La mia musica” page – displays all singles with descriptions and cover art.

export default function MusicPage() {
  // Reference to the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // States to handle arrow visibility (opacity)
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Used to show a “skeleton” effect until the image is ready.
  const [isLoaded, setIsLoaded] = useState(false);

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
        <div className="pb-6">
          <h2 className={subtitle()}>Scopri la storia dell'EP</h2>{" "}
        </div>
        {/* Contains the artist image and description */}
        <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-2 md:p-4 mx-auto  w-full max-w-5xl">
          {/* Visual placeholder while the image is loading */}
          {!isLoaded && (
            <Skeleton className="absolute inset-0 rounded-lg">
              <div className="h-full w-full bg-default-300 rounded-lg" />
            </Skeleton>
          )}

          {/* ========================== ARTIST IMAGE ========================== */}
          <div className="p-4 md:p-4 w-fit md:w-full items-center">
            <SmartImage
              isBlurred // Applies a slight blur effect
              priority
              alt="nokoru mono Artwork" // Alt text for accessibility
              className="item-center"
              sizes="400px"
              src={nokoruMonoArtwork} // Imported image
              style={{ aspectRatio: "1 / 1" }}
              width={400}
              onLoad={() => setIsLoaded(true)} // Removes skeleton when the image is fully loaded
            />
          </div>

          {/* ========================== ALBUM DESCRIPTION ========================== */}
          <div className="flex flex-col p-4">
            <div className="pb-4">
              <p>
                <em className="text-danger pr-1">nokoru mono</em> (“quelli che
                restano”) è il nome del primo progetto.
              </p>
              <p>
                Racconta il mondo interiore, le emozioni che accompagnano la
                crescita e gli spazi che si muovono dentro di noi, anche quando
                tutto sembra fermo.
              </p>
              <p>
                È un EP che osserva da vicino: stratificato, intimo,
                profondamente personale. Il suono si avvicina a una dimensione
                più R&B, calda e meditativa, che accompagna l'ascoltatore in un
                viaggio verso sè stesso.
              </p>
              <p>
                L'artwork, realizzato da Nicolò Piazza ( in arte
                <a
                  href="https://www.instagram.com/torino_ink"
                  target="_blank"
                  className="text-primary px-1 hover:underline"
                >
                  Torino Ink
                </a>
                ) sotto la direzione artistica di Lacco, si ispira all'omonima
                opera di Umberto Boccioni, facente parte del trittico "Stati
                d'animo".
              </p>
              <p>
                "nokoru mono" rappresenta il primo pezzo di un puzzle più
                grande, il primo passo di un lungo percorso.
                <br /> Un viaggio attraverso noi stessi e le altre persone.
              </p>
            </div>
            <div className="flex items-justify-center justify-center">
              <Link href="https://www.lacco.it/nokoru-mono/" target="_blank">
                <Button
                  variant="ghost"
                  color="danger"
                  className="max-w-full m-4"
                >
                  Pre-salva ora l'EP
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Intro subtitle */}
        <div className="pt-10">
          <h2 className={subtitle()}>Scopri la storia di ogni singolo</h2>
        </div>
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
