import type { LiveEvent } from "@/config/liveEvents";

import { Button, Card } from "@heroui/react";

import heroLacco from "@/assets/images/lacco/heroLacco.avif";
import Countdown from "@/components/countdown";
import SmartImage, { resolveImageSource } from "@/components/smartImage";

function MapPinIcon() {
  return (
    <svg
      className="shrink-0 opacity-60"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="shrink-0 opacity-60"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      className="shrink-0 opacity-60"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      className="shrink-0 opacity-60"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <line x1="9" x2="9" y1="6" y2="18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="shrink-0 opacity-60"
      fill="none"
      height={15}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={15}
    >
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 opacity-70"
      fill="none"
      height={13}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={13}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

type Props = {
  event: LiveEvent;
};

export default function LiveEventCard({ event }: Props) {
  const artwork = event.poster ?? heroLacco;
  const dateLabel = event.date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabelCapitalized =
    dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <Card className="relative overflow-hidden flex flex-col md:flex-row items-center justify-center p-6 md:p-8 gap-6 mx-auto w-full max-w-4xl">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
        src={resolveImageSource(artwork)}
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative shrink-0 flex items-center justify-center">
        <SmartImage
          isBlurred
          priority
          alt={`Locandina di ${event.title}`}
          src={artwork}
          style={{ aspectRatio: "1/1", objectFit: "cover" }}
          width={350}
        />
      </div>

      <div className="relative flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-black/35 p-4 md:p-6 backdrop-blur-md w-full md:w-xl">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight whitespace-pre">
            {event.title}
          </h1>
          <p className="text-white/70 text-sm tracking-widest font-medium">
            {event.venue} · {event.city}
          </p>
        </div>

        <Countdown releaseDate={event.date} variant="dark" />

        <div className="flex flex-col gap-2 w-full text-white/70 text-sm items-center">
          {/* Data del live — in evidenza come badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-base font-semibold text-white [&>svg]:text-danger [&>svg]:opacity-100">
            <CalendarIcon />
            <span>{dateLabelCapitalized}</span>
          </div>
          {event.address && (
            <a
              className="flex items-center gap-2 max-w-full underline decoration-white/30 underline-offset-4 hover:text-danger hover:decoration-danger transition-colors"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${event.venue}, ${event.address}`,
              )}`}
              rel="noopener noreferrer"
              target="_blank"
              title={`Apri in mappe: ${event.address}`}
            >
              <MapPinIcon />
              <span className="min-w-0 truncate">{event.address}</span>
              <ExternalLinkIcon />
            </a>
          )}
          <div className="flex items-center gap-2">
            <ClockIcon />
            <span>
              {event.doorsTime && `Ingresso ${event.doorsTime}`}
              {event.doorsTime && <span className="mx-1.5 opacity-40">·</span>}
              {`Show ${event.date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`}
            </span>
          </div>
          {event.lineup && event.lineup.length > 0 && (
            <div className="flex items-center gap-2">
              <MicIcon />
              <span>{event.lineup.join(", ")}</span>
            </div>
          )}
          {event.price && (
            <div className="flex items-center gap-2">
              <TicketIcon />
              <span>{event.price}</span>
            </div>
          )}
        </div>

        <Button
          aria-label="Acquista i biglietti"
          className="font-semibold px-8"
          size="lg"
          variant="danger"
          onPress={() =>
            window.open(event.ticketUrl, "_blank", "noopener,noreferrer")
          }
        >
          <svg
            aria-hidden="true"
            className="shrink-0"
            fill="none"
            height={20}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width={20}
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <line x1="9" x2="9" y1="6" y2="18" />
          </svg>
          Acquista i biglietti
        </Button>
      </div>
    </Card>
  );
}
