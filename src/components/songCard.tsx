import type { Single } from "@/config/catalog";

import { Link } from "react-router-dom";
import { Card } from "@heroui/card";

import Countdown from "@/components/countdown";
import PresaveButton from "@/components/presaveButton";
import SmartImage, { resolveImageSource } from "@/components/smartImage";

type Props = {
  single: Single;
};

// Card grande del singolo in pre-save (usata in Home), speculare ad AlbumCard:
// cover e titolo cliccabili verso la pagina della release, countdown e pulsante pre-save.
export default function SongCard({ single }: Props) {
  const releasePath = `/${single.slug}`;

  return (
    <Card className="flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-4xl">
      {/* Blurred artwork backdrop — fixed dark scrim keeps text readable regardless of cover colors */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(single.artwork)}
      />
      <div className="absolute inset-0 bg-black/55" />

      <Link
        aria-label={`Apri la pagina di ${single.title}`}
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-[1.02]"
        to={releasePath}
      >
        <SmartImage
          isBlurred
          priority
          alt={`Cover di ${single.title}`}
          src={single.artwork}
          style={{ aspectRatio: "1/1", objectFit: "cover" }}
          width={350}
        />
      </Link>

      <div className="relative flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md w-full md:w-xl">
        <div className="space-y-1">
          <span className="text-danger uppercase tracking-[0.2em] text-xs font-bold">
            {single.kind} · {single.year}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            <Link
              className="transition-colors hover:text-danger"
              to={releasePath}
            >
              {single.title}
            </Link>
          </h1>
          <p className="text-white/70 text-sm tracking-widest font-medium">
            {single.artist ?? "Lacco"}
          </p>
        </div>

        <Countdown releaseDate={single.releaseDate} variant="dark" />

        {single.streamingLinks?.hyperfollow && (
          <PresaveButton
            hyperfollowUrl={single.streamingLinks.hyperfollow}
            releaseDate={single.releaseDate}
          />
        )}
      </div>
    </Card>
  );
}
