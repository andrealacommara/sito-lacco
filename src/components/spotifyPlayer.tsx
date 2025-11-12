// ========================== MAIN IMPORTS ========================== //
// Core React hooks alongside the HeroUI primitives used by the player card.
import { useEffect, useRef, useState } from "react";
import { Card } from "@heroui/card"; // Card container for the iframe
import { Skeleton } from "@heroui/skeleton"; // Loading placeholder for smoother UX

// ========================== PROPS INTERFACE ========================== //
// Parameters accepted by the `SpotifyPlayer` component.
interface SpotifyPlayerProps {
  srcPlayer: string; // URL of the Spotify iframe to embed
  size?: "small" | "large"; // Optional size of the player
}

// ========================== MAIN COMPONENT ========================== //
export default function SpotifyPlayer({ srcPlayer, size }: SpotifyPlayerProps) {
  const isBrowser = typeof window !== "undefined";
  // Track the iframe loading state and whether it should be rendered
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadPlayer, setShouldLoadPlayer] = useState(
    () => !isBrowser || !("IntersectionObserver" in window),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lazy-load the iframe only when the card is close to (or inside) the viewport.
  useEffect(() => {
    if (shouldLoadPlayer || !isBrowser || !("IntersectionObserver" in window)) {
      return;
    }

    const current = containerRef.current;

    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadPlayer(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.25 },
    );

    observer.observe(current);

    return () => observer.disconnect();
  }, [isBrowser, shouldLoadPlayer]);

  return (
    // Main container: a centered card with hidden overflow
    <Card
      ref={containerRef}
      className="p-4 flex justify-center items-center relative overflow-hidden mx-auto w-full max-w-5xl"
    >
      {!shouldLoadPlayer ? (
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <p className="text-sm text-default-500 max-w-md">
            Il player Spotify si attiva solo quando serve per ridurre il consumo
            di dati sui dispositivi mobili.
          </p>
          <button
            className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
            type="button"
            onClick={() => setShouldLoadPlayer(true)}
          >
            Carica il player Spotify
          </button>
        </div>
      ) : (
        <>
          {/* Shows a placeholder until the iframe is ready */}
          {!isLoaded && (
            <Skeleton className="absolute inset-0 rounded-lg">
              <div className="h-full w-full bg-default-300 rounded-lg" />
            </Skeleton>
          )}

          {/* Embedded Spotify iframe */}
          <iframe
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            data-testid="embed-iframe" // Attribute useful for automated tests
            height={size === "small" ? "152" : "352"} // Adjusts height based on prop
            loading="lazy" // Optimized loading for performance
            src={srcPlayer} // Spotify URL passed as a prop
            style={{
              borderRadius: "12px", // Rounded corners for visual consistency
              opacity: isLoaded ? 1 : 0, // Makes iframe visible only after loading
              transition: "opacity 0.4s ease", // Smooth transition effect
            }}
            title="Spotify Player" // Accessible description for screen readers
            width="100%" // Adapts to container width
            onLoad={() => setIsLoaded(true)} // Updates state once loading is complete
          />
        </>
      )}
    </Card>
  );
}
