import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import CardSongExposer from "@/components/cardSongExposer";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { catalog } from "@/config/catalog";

export default function SongCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startSpacerRef = useRef<HTMLDivElement>(null);
  const endSpacerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector(".card-song");
    if (!card) return;
    container.scrollBy({
      left: direction === "left" ? -(card as HTMLElement).offsetWidth : (card as HTMLElement).offsetWidth,
      behavior: "smooth",
    });
  };

  const detectCenteredCard = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".card-song");
    if (cards.length === 0) return;
    const containerCenter =
      container.getBoundingClientRect().left +
      container.getBoundingClientRect().width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setIsAtStart(closestIndex === 0);
    setIsAtEnd(closestIndex === cards.length - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const startSpacer = startSpacerRef.current;
    const endSpacer = endSpacerRef.current;
    if (!container || !startSpacer || !endSpacer) return;

    let rafId: number | null = null;

    const updateLayout = () => {
      const card = container.querySelector(".card-song") as HTMLElement;
      if (!card) return;
      const padding = Math.max(
        0,
        (container.getBoundingClientRect().width - card.offsetWidth) / 2,
      );
      startSpacer.style.minWidth = `${padding}px`;
      endSpacer.style.minWidth = `${padding}px`;
    };

    updateLayout();
    requestAnimationFrame(() => container.scrollTo({ left: 0, behavior: "auto" }));

    const handleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(detectCenteredCard);
    };

    detectCenteredCard();
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", detectCenteredCard);
    window.addEventListener("resize", () => {
      updateLayout();
      detectCenteredCard();
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", detectCenteredCard);
    };
  }, [detectCenteredCard]);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
      <div className="flex flex-row items-center gap-4 max-w-full max-h-fit">
        <Button
          isIconOnly
          aria-label="Scorri a sinistra"
          className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition-all duration-300 hover:scale-110 ${
            isAtStart ? "opacity-0 pointer-events-none scale-75" : "opacity-100"
          }`}
          radius="full"
          variant="flat"
          onPress={() => scroll("left")}
        >
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex py-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing max-w-full"
        >
          <div ref={startSpacerRef} className="shrink-0" />
          {catalog.map((song) => (
            <div
              key={song.slug}
              className="card-song shrink-0 snap-center px-2 max-w-full transition-transform hover:scale-105 active:scale-95"
            >
              <CardSongExposer
                artworkAlt={song.alt}
                artworkSrc={song.artwork}
                preSaveMode={song.presaveMode}
                songAppleMusicLink={song.streamingLinks?.appleMusic ?? ""}
                songDescription={song.description}
                songSpotifyLink={song.streamingLinks?.spotify ?? ""}
                songTitle={song.title}
              />
            </div>
          ))}
          <div ref={endSpacerRef} className="shrink-0" />
        </div>

        <Button
          isIconOnly
          aria-label="Scorri a destra"
          className={`hidden md:flex bg-default-400 hover:bg-danger shadow-md transition-all duration-300 hover:scale-110 ${
            isAtEnd ? "opacity-0 pointer-events-none scale-75" : "opacity-100"
          }`}
          radius="full"
          variant="flat"
          onPress={() => scroll("right")}
        >
          <ChevronRightIcon className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
