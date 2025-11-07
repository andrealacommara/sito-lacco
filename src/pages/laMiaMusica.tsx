import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardSongExposer from "@/components/cardSongExposer";
import { useRef, useEffect } from "react";
import { songList } from "@/config/songList";

export default function DocsPage() {
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const delta = el.clientWidth * 0.1;
    const duration = 700; // più morbido
    const pauseAfter = 150;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (from: number, to: number, dur: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const step = (now: number) => {
          const elapsed = now - start;
          const t = Math.min(1, elapsed / dur);
          const eased = easeInOutCubic(t);
          el.scrollLeft = Math.round(from + (to - from) * eased);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    let cancelled = false;

    const hint = async () => {
      if (el.scrollWidth <= el.clientWidth) return;
      const prevSnap = el.style.scrollSnapType;
      el.style.scrollSnapType = "none";
      const startPos = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const midPos = Math.max(0, Math.min(maxScroll, startPos + delta));
      await animateScroll(startPos, midPos, duration);
      if (cancelled) {
        el.style.scrollSnapType = prevSnap;
        return;
      }
      await new Promise((res) => setTimeout(res, pauseAfter));
      if (cancelled) {
        el.style.scrollSnapType = prevSnap;
        return;
      }
      await animateScroll(midPos, startPos, duration);
      el.style.scrollSnapType = prevSnap || "";
    };

    const timer = window.setTimeout(hint, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>La mia musica</h1>
      </div>
      <h2 className={subtitle()}>Scopri la storia di ogni brano</h2>

      <div
        ref={carouselRef}
        className="flex p-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
      >
        {songList.map((song) => (
          <div
            key={song.title}
            className="shrink-0 snap-center px-2 max-w-full first:ml-[calc(50vw-140px)] last:mr-[calc(50vw-140px)] transition-transform hover:scale-105 active:scale-95"
          >
            <CardSongExposer
              artworkAlt={song.alt}
              artworkSrc={song.src}
              songTitle={song.title}
              songDescription={song.description}
              songSpotifyLink={song.spotifyLink}
              preSaveMode={song.preSaveMode}
            />
          </div>
        ))}
      </div>
    </DefaultLayout>
  );
}
