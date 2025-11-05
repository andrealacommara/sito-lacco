import { useState } from "react";
import { Card, Skeleton } from "@heroui/react";

interface SpotifyPlayerProps {
  srcPlayer: string;
  size?: "small" | "large";
}

export default function SpotifyPlayer({ srcPlayer, size }: SpotifyPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Card className="p-4 flex justify-center items-center relative overflow-hidden">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 rounded-lg">
          <div className="h-full w-full bg-default-300 rounded-lg" />
        </Skeleton>
      )}

      <iframe
        data-testid="embed-iframe"
        style={{
          borderRadius: "12px",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
        src={srcPlayer}
        width="100%"
        height={size === "small" ? "152" : "352"}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      ></iframe>
    </Card>
  );
}
