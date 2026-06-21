import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@heroui/react";

interface YoutubeEmbedProps {
  videoId: string; // ID del video YouTube (es. "dQw4w9WgXcQ")
  title?: string; // descrizione accessibile dell'iframe
}

// Embed YouTube lazy: l'iframe viene montato solo quando il riquadro entra
// (o è vicino) al viewport, per non pesare sui dispositivi mobili.
// Sorgente youtube-nocookie per ridurre il tracking.
export default function YoutubeEmbed({
  videoId,
  title = "Video del live",
}: YoutubeEmbedProps) {
  const isBrowser = typeof window !== "undefined";
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(
    () => !isBrowser || !("IntersectionObserver" in window),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad || !isBrowser || !("IntersectionObserver" in window)) {
      return;
    }

    const current = containerRef.current;

    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.25 },
    );

    observer.observe(current);

    return () => observer.disconnect();
  }, [isBrowser, shouldLoad]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl bg-black/40"
      style={{ aspectRatio: "16 / 9" }}
    >
      {!shouldLoad ? (
        <button
          className="flex h-full w-full items-center justify-center gap-2 text-sm font-semibold text-white transition hover:bg-white/5"
          type="button"
          onClick={() => setShouldLoad(true)}
        >
          <span className="text-danger text-lg">▶</span> Carica il video
        </button>
      ) : (
        <>
          {!isLoaded && (
            <Skeleton className="absolute inset-0 rounded-xl">
              <div className="h-full w-full bg-default-300 rounded-xl" />
            </Skeleton>
          )}
          <iframe
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            title={title}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      )}
    </div>
  );
}
