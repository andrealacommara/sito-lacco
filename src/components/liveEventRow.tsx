import type { LiveEvent } from "@/config/liveEvents";

import { Link } from "react-router-dom";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import SmartImage, { resolveImageSource } from "@/components/smartImage";

function ChevronRightIcon() {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Riga compatta di un live, cliccabile verso la sua pagina. Usata per la lista
// "Altri live" in fondo alla pagina evento.
export default function LiveEventRow({ event }: { event: LiveEvent }) {
  const artwork = event.poster ?? heroLacco;

  return (
    <Link
      aria-label={`Apri ${event.title}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 transition-transform hover:scale-[1.01]"
      to={`/live/${event.slug}`}
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(artwork)}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex items-center gap-4 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15">
          <SmartImage
            alt={`Locandina di ${event.title}`}
            src={artwork}
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
            width={96}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{event.title}</p>
          <p className="truncate text-sm text-white/60">
            {formatShortDate(event.date)} · {event.venue}
          </p>
        </div>

        <span className="pr-1 text-white/30 transition-colors group-hover:text-danger">
          <ChevronRightIcon />
        </span>
      </div>
    </Link>
  );
}
