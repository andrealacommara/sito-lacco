import { Card } from "@heroui/card";
import { SpotifyIcon, AppleMusicIcon } from "@/components/icons";
import SmartImage from "@/components/smartImage"; // Optimized image component with automatic loading

interface PressKitSongCardProps {
  title: string;
  year: number | string;
  artwork: string;
  spotify: string;
  appleMusic?: string;
  description?: string; // pressKitDescription
}

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
        src={artwork}
        alt={title}
        width={90}
        height={90}
        sizes="90px"
        style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
      />

      <div className="flex flex-col grow">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-default-500 text-sm">
          {year} {description ? `• ${description}` : ""}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <a href={spotify} target="_blank" aria-label="Ascolta su Spotify">
            <SpotifyIcon
              className="text-default-500 hover:text-danger transition-colors"
              size={22}
            />
          </a>
          <a
            href={appleMusic}
            target="_blank"
            aria-label="Ascolta su Apple Music"
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
