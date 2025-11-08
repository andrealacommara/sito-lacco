import { useState } from "react";
import { Card, Skeleton } from "@heroui/react";
// Importa React e due componenti di HeroUI:
// - `Card`: contenitore stilizzato per il player
// - `Skeleton`: segnaposto visivo durante il caricamento dell’iframe

// ========================== INTERFACCIA PROPS ========================== //
// Definisce i parametri accettati dal componente `SpotifyPlayer`.
interface SpotifyPlayerProps {
  srcPlayer: string; // URL dell’iframe Spotify da incorporare
  size?: "small" | "large"; // Dimensione opzionale del player
}

// ========================== COMPONENTE PRINCIPALE ========================== //
export default function SpotifyPlayer({ srcPlayer, size }: SpotifyPlayerProps) {
  // Stato che indica se l’iframe è stato caricato
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    // Contenitore principale: una card centrata con overflow nascosto
    <Card className="p-4 flex justify-center items-center relative overflow-hidden mx-auto w-full max-w-5xl">
      {/* Mostra un segnaposto finché l’iframe non è pronto */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 rounded-lg">
          <div className="h-full w-full bg-default-300 rounded-lg" />
        </Skeleton>
      )}

      {/* Iframe Spotify incorporato */}
      <iframe
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        data-testid="embed-iframe" // Attributo utile per i test automatizzati
        height={size === "small" ? "152" : "352"} // Cambia altezza in base alla prop
        loading="lazy" // Caricamento ottimizzato per le performance
        src={srcPlayer} // URL Spotify passato come prop
        style={{
          borderRadius: "12px", // Angoli arrotondati per coerenza visiva
          opacity: isLoaded ? 1 : 0, // Rende visibile l’iframe solo dopo il caricamento
          transition: "opacity 0.4s ease", // Applica una transizione morbida
        }}
        title="Spotify Player" // Descrizione accessibile per lo screen reader
        width="100%" // Si adatta alla larghezza del contenitore
        onLoad={() => setIsLoaded(true)} // Aggiorna lo stato una volta completato il caricamento
      />
    </Card>
  );
}
