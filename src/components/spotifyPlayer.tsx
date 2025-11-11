// ========================== MAIN IMPORT ========================== //
// Import React core, HeroUI components, e hook necessari
import { useState } from "react"; // React useState for state handling
import { Card, Skeleton } from "@heroui/react"; // Imports React and two HeroUI components

// ========================== PROPS INTERFACE ========================== //
// Defines the parameters accepted by the `SpotifyPlayer` component.
interface SpotifyPlayerProps {
  srcPlayer: string; // URL of the Spotify iframe to embed
  size?: "small" | "large"; // Optional size of the player
}

// ========================== MAIN COMPONENT ========================== //
export default function SpotifyPlayer({ srcPlayer, size }: SpotifyPlayerProps) {
  // State indicating if the iframe has finished loading
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    // Main container: a centered card with hidden overflow
    <Card className="p-4 flex justify-center items-center relative overflow-hidden mx-auto w-full max-w-5xl">
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
    </Card>
  );
}
