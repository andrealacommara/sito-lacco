import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import CardSongExposer from "@/components/cardSongExposer";
import { useRef, useEffect } from "react";

import cercamiArtwork from "@/assets/images/artworks/cercamiArtwork.jpg";
import mondoDentroArtwork from "@/assets/images/artworks/mondoDentroArtwork.jpg";
import rumoreDiFondoArtwork from "@/assets/images/artworks/rumoreDiFondoArtwork.jpg";
import tempoPersoArtwork from "@/assets/images/artworks/tempoPersoArtwork.jpg";
import traLeNuvoleArtwork from "@/assets/images/artworks/traLeNuvoleArtwork.jpg";

const songList = [
  {
    title: "rumore di fondo",
    src: rumoreDiFondoArtwork,
    alt: "Cover artwork di 'rumore di fondo'",
    description: "",
  },
  {
    title: "cercami",
    src: cercamiArtwork,
    alt: "Cover artwork di 'cercami'",
    description: "",
  },
  {
    title: "tra le nuvole",
    src: traLeNuvoleArtwork,
    alt: "Cover artwork di 'tra le nuvole'",
    description: "",
  },
  {
    title: "mondo dentro",
    src: mondoDentroArtwork,
    alt: "Cover artwork di 'mondo dentro'",
    description: "",
  },
  {
    title: "tempo perso",
    src: tempoPersoArtwork,
    alt: "Cover artwork di 'tempo perso'",
    description: "",
  },
];

export default function DocsPage() {
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const delta = 60;
    const duration = 350;
    const pauseAfter = 0;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

      {/* Contenitore relativo per gradienti + carosello */}
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex p-6 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
        >
          {songList.map((song) => (
            <div
              key={song.title}
              className="shrink-0 snap-center px-6 first:ml-[calc(50vw-140px)] last:mr-[calc(50vw-140px)] transition-transform hover:scale-105 active:scale-95"
            >
              <CardSongExposer
                artworkAlt={song.alt}
                artworkSrc={song.src}
                artworkTitle={song.title}
                artworkDescription={song.description}
              />
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
