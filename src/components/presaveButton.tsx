import { useState } from "react";
import { Button } from "@heroui/button";

import { SpotifyIcon } from "@/components/icons";

type Props = {
  hyperfollowUrl: string;
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

export default function PresaveButton({ hyperfollowUrl }: Props) {
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <Button
        isDisabled
        className="font-semibold px-8"
        color="success"
        size="lg"
      >
        <SpotifyIcon />
        Pre-salvato ✓
      </Button>
    );
  }

  return (
    <Button
      aria-label="Pre-save su Spotify"
      className="font-semibold px-8"
      color="success"
      size="lg"
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
