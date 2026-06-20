import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

import { SpotifyIcon } from "@/components/icons";
import { hasReleased } from "@/components/countdown";

type Props = {
  hyperfollowUrl: string;
  releaseDate: Date;
};

function openCenteredPopup(url: string, fallbackUrl: string) {
  const w = 820;
  const h = 600;
  const left = Math.round((window.screen.width - w) / 2);
  const top = Math.round((window.screen.height - h) / 3);
  const popup = window.open(
    url,
    "presave-spotify",
    `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    window.open(fallbackUrl, "_blank", "noopener,noreferrer");
  }
}

export default function PresaveButton({ hyperfollowUrl, releaseDate }: Props) {
  const [saved, setSaved] = useState(false);
  const [isReleased, setIsReleased] = useState(() => hasReleased(releaseDate));

  useEffect(() => {
    if (isReleased) return;
    const timer = setInterval(() => {
      if (hasReleased(releaseDate)) setIsReleased(true);
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate, isReleased]);

  if (isReleased) {
    return (
      <Button
        aria-label="Ascoltala su Spotify"
        className="font-semibold px-8 bg-success text-white hover:bg-success/90"
        size="lg"
        variant="primary"
        onPress={() => openCenteredPopup(hyperfollowUrl, hyperfollowUrl)}
      >
        <SpotifyIcon />
        Ascoltala su Spotify
      </Button>
    );
  }

  if (saved) {
    return (
      <Button
        isDisabled
        className="font-semibold px-8 bg-success text-white hover:bg-success/90"
        size="lg"
        variant="primary"
      >
        <SpotifyIcon />
        Pre-salvato ✓
      </Button>
    );
  }

  return (
    <Button
      aria-label="Pre-save su Spotify"
      className="font-semibold px-8 bg-success text-white hover:bg-success/90"
      size="lg"
      variant="primary"
      onPress={() => {
        openCenteredPopup(hyperfollowUrl, hyperfollowUrl);
        setSaved(true);
      }}
    >
      <SpotifyIcon />
      Pre-save su Spotify
    </Button>
  );
}
