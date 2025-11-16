// ========================== MAIN IMPORTS ========================== //
// HeroUI card plus shared icon and image utilities.
import { Card } from "@heroui/card";
import { SpotifyIcon, AppleMusicIcon } from "@/components/icons"; // Platform icons
import SmartImage from "@/components/smartImage"; // Responsive artwork component

// ========================== PROPS ========================== //
// Metadata printed inside each press-kit song card.
interface PressKitSongCardProps {
  title: string;
  year: number | string;
  artwork: string;
  spotify: string;
  appleMusic?: string;
  description?: string; // Optional press-kit description
}

// ========================== COMPONENT ========================== //
/**
 * Compact press-kit card that surfaces artwork, metadata, and streaming links.
 * Used inside the “Press Kit” page to present singles in a uniform layout.
 */
export default function PressKitSongCard({
  title,
  year,
  artwork,
  spotify,
  appleMusic,
  description,
}: PressKitSongCardProps) {
  return (
    <Card className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center p-6 gap-4 mx-auto  w-full max-w-5xl">
      <SmartImage
        alt={title}
        height={90}
        sizes="90px"
        src={artwork}
        style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
        width={90}
      />

      <div className="flex flex-col grow">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-default-500 text-sm">
          {year} {description ? `• ${description}` : ""}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <a
            aria-label="Apri su Spotify"
            href={spotify}
            rel="noreferrer"
            target="_blank"
          >
            <SpotifyIcon
              className="text-default-500 hover:text-danger transition-colors"
              size={22}
            />
          </a>
          <a
            aria-label="Apri su Apple Music"
            href={appleMusic}
            rel="noreferrer"
            target="_blank"
          >
            <AppleMusicIcon
              className="text-default-500 hover:text-danger transition-colors"
              size={22}
            />
          </a>
        </div>
      </div>
    </Card>
  );
}
