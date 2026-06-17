import type { Album } from "@/config/catalog";

import { Link } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import SmartImage, { resolveImageSource } from "@/components/smartImage";

function TracklistIcon() {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      fill="none"
      height={18}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={18}
    >
      <line x1="3" x2="15" y1="6" y2="6" />
      <line x1="3" x2="15" y1="12" y2="12" />
      <line x1="3" x2="9" y1="18" y2="18" />
      <circle cx="17" cy="17" r="3" />
      <path d="M20 17V8l1.5-.5" />
    </svg>
  );
}

type Props = {
  album: Album;
};

export default function AlbumCard({ album }: Props) {
  const albumPath = `/${album.slug}`;
  const paragraphs = album.description.split("\n").filter(Boolean);

  return (
    <Card className="relative overflow-hidden flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-4xl">
      {/* Blurred artwork backdrop */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(album.artwork)}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Cover + CTA tracklist (centrato sotto l'artwork) */}
      <div className="relative shrink-0 flex flex-col items-center gap-4">
        <Link
          aria-label={`Apri la pagina di ${album.title}`}
          className="flex items-center justify-center transition-transform hover:scale-[1.02]"
          to={albumPath}
        >
          <SmartImage
            isBlurred
            priority
            alt={album.alt}
            src={album.artwork}
            style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
            width={350}
          />
        </Link>

        {!album.presaveMode && (
          <Button
            fullWidth
            as={Link}
            className="font-semibold tracking-wide text-white"
            color="danger"
            size="lg"
            to={albumPath}
            variant="light"
          >
            <TracklistIcon />
            Scopri la tracklist
          </Button>
        )}
      </div>

      <div className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md flex-1">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-danger uppercase tracking-[0.2em] text-xs font-bold">
            {album.kind} · {album.year}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            <Link
              className="hover:text-danger transition-colors"
              to={albumPath}
            >
              {album.title}
            </Link>
          </h2>
        </div>

        <div className="text-white/80 text-sm leading-relaxed space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {album.credits && album.credits.length > 0 && (
          <div className="text-white/60 text-xs space-y-1">
            {album.credits.map((credit) =>
              credit.url ? (
                <a
                  key={credit.label}
                  className="block text-white/70 hover:underline"
                  href={credit.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {credit.label}
                </a>
              ) : (
                <p key={credit.label}>{credit.label}</p>
              ),
            )}
          </div>
        )}

        {album.presaveMode ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Countdown releaseDate={album.releaseDate} variant="dark" />
            {album.streamingLinks?.hyperfollow && (
              <PresaveButton
                hyperfollowUrl={album.streamingLinks.hyperfollow}
                releaseDate={album.releaseDate}
              />
            )}
          </div>
        ) : (
          (album.streamingLinks?.spotify ||
            album.streamingLinks?.appleMusic) && (
            <div className="flex flex-col md:flex-row gap-2 w-full">
              {album.streamingLinks?.spotify && (
                <div className="flex-1 min-w-0">
                  <Button
                    fullWidth
                    aria-label={`Ascolta ${album.title} su Spotify`}
                    className="min-w-0"
                    color="success"
                    onPress={() =>
                      window.open(
                        album.streamingLinks?.spotify,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <SpotifyIcon />
                    Spotify
                  </Button>
                </div>
              )}
              {album.streamingLinks?.appleMusic && (
                <div className="flex-1 min-w-0">
                  <Button
                    fullWidth
                    aria-label={`Ascolta ${album.title} su Apple Music`}
                    className="min-w-0"
                    color="danger"
                    onPress={() =>
                      window.open(
                        album.streamingLinks?.appleMusic,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <AppleMusicIcon />
                    Apple Music
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Card>
  );
}
